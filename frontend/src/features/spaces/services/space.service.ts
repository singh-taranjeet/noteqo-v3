import { cryptoService, CRYPTO_CONFIG } from "@/features/crypto";
import { storageService, STORAGE_KEYS, db } from "@/features/storage";
import { logService } from "@/services/log.service";
import { spaceApiService } from "./space-api.service";
import {
  SPACE_DEFAULTS,
  SPACE_TYPE,
  SPACES_MESSAGES,
} from "@/features/spaces/constants/spaces.constants";
import type {
  Space,
  SpaceType,
  RemoteSpace,
} from "@/features/spaces/types/spaces.types";
import type { Note } from "@/features/workspace";
import { noteService } from "@/features/workspace";
import { isOnline } from "@/lib/utils";
import { spaceSyncQueueService } from "./space-sync-queue.service";
import { SpaceLocalStorageService } from "./space-local-storage.service";
import { NoteLocalService } from "@/features/workspace/services/note-local.service";

export const spaceService = {
  async generateKeys() {
    const spaceKeyBytes = globalThis.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.MASTER_KEY_BYTES_LENGTH),
    );
    const spaceKeyBase64 = cryptoService.encodeBase64(spaceKeyBytes.buffer);

    const ownerKeySlot = await spaceService.rsaEncryptSpaceKey(spaceKeyBytes);
    return {
      spaceKeyBase64,
      ownerKeySlot,
      spaceKeyBytes,
    };
  },

  async createSpace(
    name: string = SPACE_DEFAULTS.NAME,
    type: SpaceType = SPACE_TYPE.PERSONAL,
  ): Promise<Space> {
    const now = new Date().toISOString();

    const { ownerKeySlot, spaceKeyBase64, spaceKeyBytes } =
      await spaceService.generateKeys();

    const spaceId = crypto.randomUUID();

    const space: Space = {
      id: spaceId,
      name,
      type,
      isDefault: false,
      spaceKey: spaceKeyBase64,
      createdAt: now,
      updatedAt: now,
    };

    // Direct Dexie write — useLiveQuery picks this up automatically
    await db.spaces.put(space);

    await spaceSyncQueueService.enqueue({
      type: "CREATE",
      entityId: space.id,
      payload: {
        name,
        type,
        id: space.id,
        now,
        ownerKeySlot,
        spaceKeyBytes,
      },
      entity: "space",
    });

    return space;
  },

  async updateSpace(
    spaceId: string,
    updates: { name?: string; description?: string },
  ): Promise<Space> {
    const space = await db.spaces.get(spaceId);
    if (!space) throw new Error("Space not found");

    const now = new Date().toISOString();
    const updatedSpace = {
      ...space,
      ...updates,
      updatedAt: now,
    };

    await db.spaces.put(updatedSpace);

    // We get the space key to encrypt the payload for sync
    const spaceKeyBytes = await spaceService.getSpaceKeyBytes(spaceId);

    const payload: Record<string, string> = { id: spaceId, updatedAt: now };
    if (updates.name !== undefined) {
      payload.encryptedName = await spaceService.encryptWithSpaceKey(
        updates.name,
        spaceKeyBytes,
      );
    }
    if (updates.description !== undefined) {
      payload.encryptedDescription = await spaceService.encryptWithSpaceKey(
        updates.description,
        spaceKeyBytes,
      );
    }

    await spaceSyncQueueService.enqueue({
      type: "UPDATE",
      entityId: spaceId,
      payload,
      entity: "space",
    });

    return updatedSpace;
  },

  async getRemoteSpacesAndNotes() {
    // if User is online

    if (isOnline()) {
      const fetchOnlyRecentlyUpdated = SpaceLocalStorageService.isFetched();

      const remoteSpaces = fetchOnlyRecentlyUpdated
        ? await spaceApiService.getRecentlyUpdated()
        : await spaceApiService.getAll();

      // Decrypt all the spaces
      const decryptedSpaces = await Promise.all(
        remoteSpaces.map((rs) => spaceService.decryptRemoteSpace(rs)),
      );

      const validSpaces = decryptedSpaces.filter((s): s is Space => s !== null);

      // Direct Dexie write
      await db.spaces.bulkPut(validSpaces);

      // Decrypt all the notes
      const decryptedNotes: Note[] = [];
      const allRemoteNotes = remoteSpaces.flatMap((rs) => rs.notes || []);
      for (const remoteNote of allRemoteNotes) {
        const decryptedNote = await noteService.decryptNote(remoteNote);
        const localNote = await NoteLocalService.get(remoteNote.id);
        const localTime = localNote?.updatedAt
          ? new Date(localNote.updatedAt).getTime()
          : 0;
        const remoteTime = decryptedNote?.updatedAt
          ? new Date(decryptedNote.updatedAt).getTime()
          : 0;

        // Last-write-wins merge
        const latestContent =
          remoteTime >= localTime ? decryptedNote?.content : localNote?.content;

        if (decryptedNote) {
          decryptedNotes.push({
            ...decryptedNote,
            content: latestContent,
          });
        }
      }

      // Direct Dexie write — useLiveQuery picks this up automatically
      await NoteLocalService.bulkUpdate(decryptedNotes);

      SpaceLocalStorageService.setFetched();
    }
  },

  async getLocalSpacesAndNotes(): Promise<{ spaces: Space[]; notes: Note[] }> {
    const notes = await noteService.getAllLocalNotes();
    const spaces = await this.getLocalSpaces();

    return { spaces, notes };
  },

  async getLocalSpaces(): Promise<Space[]> {
    return db.spaces.toArray();
  },

  async getCachedSpaceKey(spaceId: string): Promise<string | null> {
    const space = await db.spaces.get(spaceId);
    return space?.spaceKey ?? null;
  },

  async getSpaceKeyBytes(spaceId: string): Promise<Uint8Array> {
    const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);
    if (!spaceKeyBase64) {
      throw new Error(`Space key not found for space ${spaceId}`);
    }
    return new Uint8Array(cryptoService.decodeBase64(spaceKeyBase64));
  },

  async decryptRemoteSpace(remote: RemoteSpace): Promise<Space | null> {
    try {
      // Find the user's key slot
      const keySlot = remote.keySlots?.[0];
      if (!keySlot) {
        logService.warn(`No key slot found for space ${remote.id}`);
        return null;
      }

      // RSA-decrypt the space key
      const spaceKeyBytes = await spaceService.rsaDecryptSpaceKey(
        keySlot.encryptedSpaceKey,
      );
      const spaceKeyBase64 = cryptoService.encodeBase64(
        spaceKeyBytes.buffer as ArrayBuffer,
      );

      // Decrypt the space name
      const name = await spaceService.decryptWithSpaceKey(
        remote.encryptedName,
        spaceKeyBytes,
      );

      return {
        id: remote.id,
        name,
        isDefault: remote.isDefault,
        type: remote.type,
        spaceKey: spaceKeyBase64,
        createdAt: remote.createdAt,
        updatedAt: remote.updatedAt ?? remote.createdAt,
      };
    } catch (err) {
      logService.error(`Failed to decrypt space ${remote.id}`, err);
      return null;
    }
  },

  async encryptWithSpaceKey(
    plaintext: string,
    spaceKeyBytes: Uint8Array,
  ): Promise<string> {
    return cryptoService.encryptString(plaintext, spaceKeyBytes);
  },

  async decryptWithSpaceKey(
    ciphertext: string,
    spaceKeyBytes: Uint8Array,
  ): Promise<string> {
    if (!ciphertext || !ciphertext.includes(":")) {
      logService.warn(
        "Invalid ciphertext format for space name, returning as plaintext",
      );
      return ciphertext;
    }

    try {
      return await cryptoService.decryptString(ciphertext, spaceKeyBytes);
    } catch (err) {
      logService.warn(
        "Decryption failed for space name, treating as plaintext fallback.",
        err,
      );
      return ciphertext;
    }
  },

  async rsaEncryptSpaceKey(spaceKeyBytes: Uint8Array): Promise<string> {
    const publicKeyJwk = await storageService.get<string>(
      STORAGE_KEYS.PUBLIC_KEY,
    );
    if (!publicKeyJwk) {
      throw new Error(SPACES_MESSAGES.MISSING_PUBLIC_KEY);
    }

    const rsaPublicKey = await globalThis.crypto.subtle.importKey(
      "jwk",
      JSON.parse(publicKeyJwk) as JsonWebKey,
      {
        name: CRYPTO_CONFIG.ALGORITHMS.RSA,
        hash: CRYPTO_CONFIG.ALGORITHMS.HASH,
      },
      false,
      ["encrypt"],
    );

    const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
      { name: CRYPTO_CONFIG.ALGORITHMS.RSA },
      rsaPublicKey,
      spaceKeyBytes as BufferSource,
    );

    return cryptoService.encodeBase64(encryptedBuffer);
  },

  async rsaDecryptSpaceKey(
    encryptedSpaceKeyBase64: string,
  ): Promise<Uint8Array> {
    const privateKey = await storageService.get<string>(
      STORAGE_KEYS.PRIVATE_KEY,
    );

    if (!privateKey) {
      throw new Error(SPACES_MESSAGES.MISSING_PRIVATE_KEY);
    }

    const rsaPrivateKey = await globalThis.crypto.subtle.importKey(
      "jwk",
      JSON.parse(privateKey) as JsonWebKey,
      {
        name: CRYPTO_CONFIG.ALGORITHMS.RSA,
        hash: CRYPTO_CONFIG.ALGORITHMS.HASH,
      },
      false,
      ["decrypt"],
    );

    const encryptedBuffer = cryptoService.decodeBase64(encryptedSpaceKeyBase64);
    const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
      { name: CRYPTO_CONFIG.ALGORITHMS.RSA },
      rsaPrivateKey,
      encryptedBuffer,
    );

    return new Uint8Array(decryptedBuffer);
  },
};
