import { cryptoService, CRYPTO_CONFIG } from "@/features/crypto";
import { storageService, STORAGE_KEYS, db } from "@/features/storage";
import { logService } from "@/services/log.service";
import { spaceApiService } from "./space-api.service";
import {
  LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED,
  SPACE_DEFAULTS,
  SPACE_TYPE,
  SPACES_MESSAGES,
  SPACES_QUERY_KEY,
} from "../constants/spaces.constants";
import type { Space, SpaceType, RemoteSpace } from "../types/spaces.types";
import type { Note } from "@/features/workspace";
import { noteService } from "@/features/workspace";
import { isOnline } from "@/lib/utils";
import { getQueryClient } from "@/components/Providers/Providers";

export const spaceService = {
  /**
   * Creates a space: generates space key, encrypts name, RSA-wraps key, calls API, caches locally.
   */
  async createSpace(
    name: string = SPACE_DEFAULTS.NAME,
    type: SpaceType = SPACE_TYPE.PERSONAL,
  ): Promise<Space> {
    const now = new Date().toISOString();
    // 1. Generate a random AES-256 space key
    const spaceKeyBytes = globalThis.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.MASTER_KEY_BYTES_LENGTH),
    );
    const spaceKeyBase64 = cryptoService.encodeBase64(spaceKeyBytes.buffer);

    // 2. Encrypt the space name with the space key
    const encryptedName = await spaceService.encryptWithSpaceKey(
      name,
      spaceKeyBytes,
    );

    // 3. RSA-encrypt the space key with the user's public key
    const ownerKeySlot = await spaceService.rsaEncryptSpaceKey(spaceKeyBytes);

    // 4. Call API
    const spaceId = crypto.randomUUID();
    const remoteSpace = await spaceApiService.create({
      id: spaceId,
      encryptedName,
      type,
      ownerKeySlot,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Cache locally in Dexie
    const space: Space = {
      id: remoteSpace.id,
      name,
      type,
      isDefault: remoteSpace.isDefault,
      spaceKey: spaceKeyBase64,
      createdAt: remoteSpace.createdAt ?? now,
      updatedAt: remoteSpace.updatedAt ?? now,
    };

    await db.spaces.put(space);

    return space;
  },

  async getRemoteSpacesAndNotes() {
    // if User is online

    if (isOnline()) {
      const fetchOnlyRecentlyUpdated = !!localStorage.getItem(
        LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED,
      );

      const remoteSpaces = fetchOnlyRecentlyUpdated
        ? await spaceApiService.getRecentlyUpdated()
        : await spaceApiService.getAll();

      // Decrypt all the spaces
      const decryptedSpaces = await Promise.all(
        remoteSpaces.map((rs) => spaceService.decryptRemoteSpace(rs)),
      );

      const validSpaces = decryptedSpaces.filter((s): s is Space => s !== null);

      // Store all spaces in local db
      await db.spaces.bulkPut(validSpaces);

      // Decrypt all the notes
      const decryptedNotes: Note[] = [];
      const allRemoteNotes = remoteSpaces.flatMap((rs) => rs.notes || []);
      for (const remoteNote of allRemoteNotes) {
        const decryptedNote = await noteService.decryptNote(remoteNote);
        const localNote = await db.notes.get(remoteNote.id);
        const localTime = localNote?.updatedAt
          ? new Date(localNote.updatedAt).getTime()
          : 0;
        const remoteTime = decryptedNote?.updatedAt
          ? new Date(decryptedNote.updatedAt).getTime()
          : 0;

        const latestContent =
          remoteTime >= localTime ? decryptedNote?.content : localNote?.content;

        if (decryptedNote) {
          decryptedNotes.push({
            ...decryptedNote,
            content: latestContent,
          });
        }
      }

      // Store all notesin local db
      await db.notes.bulkPut(decryptedNotes);
      localStorage.setItem(LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED, "done");
      // invalidate the react query SPACES_QUERY_KEY
      const queryClient = getQueryClient();
      await queryClient.invalidateQueries({
        queryKey: [SPACES_QUERY_KEY.LOCAL_SPACES],
      });
    }
  },

  /**
   * Fetch spaces with notes and decrypt them and store them in the local db
   * If the local db is empty, fetch all spaces, else fetch only recently updated spaces
   */
  async getLocalSpacesAndNotes(): Promise<{ spaces: Space[]; notes: Note[] }> {
    const notes = await noteService.getAllLocalNotes();
    const spaces = await this.getLocalSpaces();

    return { spaces, notes };
  },

  /**
   * Returns locally cached spaces from Dexie.
   */
  async getLocalSpaces(): Promise<Space[]> {
    return db.spaces.toArray();
  },

  /**
   * Returns the cached space key for a given spaceId.
   */
  async getCachedSpaceKey(spaceId: string): Promise<string | null> {
    const space = await db.spaces.get(spaceId);
    return space?.spaceKey ?? null;
  },

  /**
   * Returns the space key as a Uint8Array for a given spaceId.
   * Throws if no cached key is found.
   */
  async getSpaceKeyBytes(spaceId: string): Promise<Uint8Array> {
    const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);
    if (!spaceKeyBase64) {
      throw new Error(`Space key not found for space ${spaceId}`);
    }
    return new Uint8Array(cryptoService.decodeBase64(spaceKeyBase64));
  },

  /**
   * Decrypts a remote space response into a local Space object.
   */
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

  /**
   * Encrypts a plaintext string with the AES space key. Returns base64 "iv:ciphertext".
   */
  async encryptWithSpaceKey(
    plaintext: string,
    spaceKeyBytes: Uint8Array,
  ): Promise<string> {
    return cryptoService.encryptString(plaintext, spaceKeyBytes);
  },

  /**
   * Decrypt the space parameters.
   */
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

  /**
   * RSA-encrypts the space key bytes with the user's public key.
   */
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
