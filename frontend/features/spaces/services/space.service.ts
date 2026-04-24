import { cryptoService, CRYPTO_CONFIG } from "@/features/crypto";
import { storageService, STORAGE_KEYS, db } from "@/features/storage";
import { logService } from "@/services/log.service";
import { spaceApiService } from "./space-api.service";
import {
  SPACE_DEFAULTS,
  SPACE_TYPE,
  SPACES_MESSAGES,
  NOTE_FALLBACKS,
} from "../constants/spaces.constants";
import type {
  Space,
  SpaceType,
  RemoteSpace,
  RemoteSpaceNote,
} from "../types/spaces.types";
import type { Note } from "@/features/workspace";

export const spaceService = {
  /**
   * Creates a space: generates space key, encrypts name, RSA-wraps key, calls API, caches locally.
   */
  async createSpace(
    name: string = SPACE_DEFAULTS.NAME,
    type: SpaceType = SPACE_TYPE.PERSONAL,
  ): Promise<Space> {
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
    });

    // 5. Cache locally in Dexie
    const now = new Date().toISOString();
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

  /**
   * Fetches all spaces from API, decrypts names, caches locally.
   */
  async getAllSpaces(): Promise<Space[]> {
    const remoteSpaces = await spaceApiService.getAll();

    const decryptedSpaces = await Promise.all(
      remoteSpaces.map((rs) => spaceService.decryptRemoteSpace(rs)),
    );

    const validSpaces = decryptedSpaces.filter((s): s is Space => s !== null);

    // Cache all spaces locally
    await db.spaces.bulkPut(validSpaces);

    return validSpaces;
  },

  /**
   * Returns locally cached spaces from Dexie.
   */
  async getCachedSpaces(): Promise<Space[]> {
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
   * Decrypts a note using the space key (not per-note RSA).
   */
  async decryptSpaceNote(
    remoteNote: RemoteSpaceNote,
    spaceKeyBase64: string,
  ): Promise<Note | null> {
    try {
      if (!remoteNote.ciphertext?.includes(":")) {
        logService.warn(`Invalid ciphertext for note ${remoteNote.id}`);
        return null;
      }

      const spaceKeyBuffer = cryptoService.decodeBase64(spaceKeyBase64);
      const spaceKeyBytes = new Uint8Array(spaceKeyBuffer);

      // Parse iv:ciphertext
      const [iv64, cipher64] = remoteNote.ciphertext.split(":");
      const iv = new Uint8Array(cryptoService.decodeBase64(iv64));
      const cipherBuffer = cryptoService.decodeBase64(cipher64);

      // Import AES key
      const aesKey = await globalThis.crypto.subtle.importKey(
        "raw",
        spaceKeyBytes as BufferSource,
        { name: CRYPTO_CONFIG.ALGORITHMS.AES },
        false,
        ["decrypt"],
      );

      // Decrypt
      const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
        { name: CRYPTO_CONFIG.ALGORITHMS.AES, iv },
        aesKey,
        cipherBuffer,
      );

      const jsonStr = new TextDecoder().decode(decryptedBuffer);
      const payload = JSON.parse(jsonStr) as {
        title?: string;
        emoji?: string;
        coverImage?: string;
        content?: unknown;
      };

      return {
        id: remoteNote.id,
        title: payload.title ?? NOTE_FALLBACKS.TITLE,
        emoji: payload.emoji ?? NOTE_FALLBACKS.EMOJI,
        coverImage: payload.coverImage ?? NOTE_FALLBACKS.COVER_IMAGE,
        content: payload.content ?? null,
        syncStatus: "synced",
        spaceId: remoteNote.spaceId,
        type: remoteNote.type as "private" | "shared",
        createdAt: remoteNote.createdAt,
        updatedAt: remoteNote.updatedAt ?? remoteNote.createdAt,
      };
    } catch (err) {
      logService.error(`Failed to decrypt note ${remoteNote.id}`, err);
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
    const aesKey = await globalThis.crypto.subtle.importKey(
      "raw",
      spaceKeyBytes as BufferSource,
      { name: CRYPTO_CONFIG.ALGORITHMS.AES },
      false,
      ["encrypt"],
    );

    const iv = globalThis.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.IV_BYTES_LENGTH),
    );
    const encoder = new TextEncoder();
    const encrypted = await globalThis.crypto.subtle.encrypt(
      { name: CRYPTO_CONFIG.ALGORITHMS.AES, iv },
      aesKey,
      encoder.encode(plaintext),
    );

    return `${cryptoService.encodeBase64(iv.buffer)}:${cryptoService.encodeBase64(encrypted)}`;
  },

  /**
   * Decrypts a "iv:ciphertext" string with the AES space key. Returns plaintext.
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
      const [iv64, cipher64] = ciphertext.split(":");
      const iv = new Uint8Array(cryptoService.decodeBase64(iv64));
      const cipherBuffer = cryptoService.decodeBase64(cipher64);

      const aesKey = await globalThis.crypto.subtle.importKey(
        "raw",
        spaceKeyBytes as BufferSource,
        { name: CRYPTO_CONFIG.ALGORITHMS.AES },
        false,
        ["decrypt"],
      );

      const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
        { name: CRYPTO_CONFIG.ALGORITHMS.AES, iv },
        aesKey,
        cipherBuffer,
      );

      return new TextDecoder().decode(decryptedBuffer);
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
