"use client";
import { logService } from "@/services/log.service";
import { CRYPTO_CONFIG } from "../constants/crypto.constants";
import { storageService, STORAGE_KEYS } from "@/features/storage";

/**
 * Utility functions for generating and managing E2E encryption keys.
 * This is client-side only (requires globalThis.crypto).
 */

// Removed internal base64 helpers to expose them directly on cryptoService

export const cryptoService = {
  /**
   * Generates a 256-bit symmetric key acting as the Master Key / Recovery Code.
   * Returns a base64 string.
   */
  generateMasterKey: (): string => {
    const randomBytes = globalThis.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.MASTER_KEY_BYTES_LENGTH),
    );
    return cryptoService.encodeBase64(randomBytes.buffer);
  },

  /**
   * Generates a 256-bit symmetric note key. Returns a base64 string.
   */
  generateDocumentKey: (): string => {
    const randomBytes = globalThis.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.MASTER_KEY_BYTES_LENGTH),
    );
    return cryptoService.encodeBase64(randomBytes.buffer);
  },

  encodeBase64: (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return globalThis.btoa(binary);
  },

  decodeBase64: (base64: string): ArrayBuffer => {
    const binaryString = globalThis.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },

  /**
   * AES-GCM encrypt a plaintext string using raw key bytes.
   * Returns a base64 string in the format "iv:ciphertext".
   */
  encryptString: async (
    plaintext: string,
    keyBytes: Uint8Array,
  ): Promise<string> => {
    const aesKey = await globalThis.crypto.subtle.importKey(
      CRYPTO_CONFIG.EXPORT_FORMAT.RAW,
      keyBytes as BufferSource,
      { name: CRYPTO_CONFIG.ALGORITHMS.AES },
      false,
      ["encrypt"],
    );

    const iv = globalThis.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.IV_BYTES_LENGTH),
    );
    const encrypted = await globalThis.crypto.subtle.encrypt(
      { name: CRYPTO_CONFIG.ALGORITHMS.AES, iv },
      aesKey,
      new TextEncoder().encode(plaintext),
    );

    return `${cryptoService.encodeBase64(iv.buffer)}:${cryptoService.encodeBase64(encrypted)}`;
  },

  /**
   * AES-GCM decrypt a "iv:ciphertext" base64 string using raw key bytes.
   * Returns the decrypted plaintext string.
   */
  decryptString: async (
    ciphertext: string,
    keyBytes: Uint8Array,
  ): Promise<string> => {
    const [iv64, cipher64] = ciphertext.split(":");
    const iv = new Uint8Array(cryptoService.decodeBase64(iv64));
    const cipherBuffer = cryptoService.decodeBase64(cipher64);

    const aesKey = await globalThis.crypto.subtle.importKey(
      CRYPTO_CONFIG.EXPORT_FORMAT.RAW,
      keyBytes as BufferSource,
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
  },

  /**
   * Generates an RSA-OAEP Key Pair.
   * Exports the public and private keys in JWK format.
   */
  generateKeyPair: async (): Promise<{
    publicKey: string;
    privateKey: string;
  }> => {
    const keyPair = await globalThis.crypto.subtle.generateKey(
      {
        name: CRYPTO_CONFIG.ALGORITHMS.RSA,
        modulusLength: CRYPTO_CONFIG.RSA_MODULUS_LENGTH,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: CRYPTO_CONFIG.ALGORITHMS.HASH,
      },
      true, // extractable
      ["encrypt", "decrypt"],
    );

    const exportedPublicKey = await globalThis.crypto.subtle.exportKey(
      CRYPTO_CONFIG.EXPORT_FORMAT.JWK,
      keyPair.publicKey,
    );
    const exportedPrivateKey = await globalThis.crypto.subtle.exportKey(
      CRYPTO_CONFIG.EXPORT_FORMAT.JWK,
      keyPair.privateKey,
    );

    return {
      publicKey: JSON.stringify(exportedPublicKey),
      privateKey: JSON.stringify(exportedPrivateKey),
    };
  },

  /**
   * Encrypts the raw private key payload using the provided master key.
   * Uses AES-GCM.
   */
  encryptPrivateKey: async (
    privateKeyPayload: string,
    base64MasterKey: string,
  ): Promise<string> => {
    const keyBytes = new Uint8Array(
      cryptoService.decodeBase64(base64MasterKey),
    );
    return cryptoService.encryptString(privateKeyPayload, keyBytes);
  },

  /**
   * Decrypts the private key using the master key.
   */
  decryptPrivateKey: async (
    encryptedPrivateKeyPayload: string,
    base64MasterKey: string,
  ): Promise<string> => {
    const keyBytes = new Uint8Array(
      cryptoService.decodeBase64(base64MasterKey),
    );
    return cryptoService.decryptString(encryptedPrivateKeyPayload, keyBytes);
  },

  /**
   * Decrypts the note payload executing the full Web Crypto cascade.
   */
  decryptDocument: async (
    ciphertextPayload: string,
    encryptedDocKeyBase64: string,
  ): Promise<{ payload: unknown; noteKeyBase64: string } | undefined> => {
    // 1. Get raw Master Key & encrypted Private Key from Storage
    const base64MasterKey = await storageService.get<string>(
      STORAGE_KEYS.MASTER_KEY,
    );

    const privateKey = await storageService.get(STORAGE_KEYS.PRIVATE_KEY);

    if (!base64MasterKey || !privateKey) {
      logService.warn(
        "Missing local keys correctly established to decrypt private key.",
      );
      return;
    }

    // 2. Import User's Private RSA Key
    const rsaPrivateKey = await globalThis.crypto.subtle.importKey(
      "jwk",
      JSON.parse(privateKey as string) as JsonWebKey,
      {
        name: CRYPTO_CONFIG.ALGORITHMS.RSA,
        hash: CRYPTO_CONFIG.ALGORITHMS.HASH,
      },
      false,
      ["decrypt"],
    );

    // 4. Decrypt Doc Key using RSA
    const encryptedDocKeyBuffer = cryptoService.decodeBase64(
      encryptedDocKeyBase64,
    );
    const decryptedDocKeyBuffer = await globalThis.crypto.subtle.decrypt(
      { name: CRYPTO_CONFIG.ALGORITHMS.RSA },
      rsaPrivateKey,
      encryptedDocKeyBuffer,
    );

    // 5. Import AES Doc Key
    const aesDocKey = await globalThis.crypto.subtle.importKey(
      "raw",
      decryptedDocKeyBuffer,
      { name: CRYPTO_CONFIG.ALGORITHMS.AES },
      false,
      ["decrypt"],
    );

    // 6. Decrypt Document Ciphertext
    if (!ciphertextPayload || !ciphertextPayload.includes(":")) {
      throw new Error("Invalid ciphertext payload format");
    }

    const [docIv64, docCipher64] = ciphertextPayload.split(":");
    const docIv = cryptoService.decodeBase64(docIv64);
    const docCipher = cryptoService.decodeBase64(docCipher64);

    const decryptedDocBuffer = await globalThis.crypto.subtle.decrypt(
      {
        name: CRYPTO_CONFIG.ALGORITHMS.AES,
        iv: new Uint8Array(docIv),
      },
      aesDocKey,
      docCipher,
    );

    const documentJsonStr = new TextDecoder().decode(decryptedDocBuffer);

    return {
      payload: JSON.parse(documentJsonStr),
      noteKeyBase64: cryptoService.encodeBase64(decryptedDocKeyBuffer),
    };
  },

  /**
   * Encrypts an ArrayBuffer (e.g. File) using the AES-GCM Space Key.
   * Returns a Blob containing the concatenated IV and Ciphertext.
   */
  encryptBuffer: async (
    buffer: ArrayBuffer,
    base64SpaceKey: string,
  ): Promise<Blob> => {
    const rawSpaceKey = cryptoService.decodeBase64(base64SpaceKey);
    const aesKey = await globalThis.crypto.subtle.importKey(
      CRYPTO_CONFIG.EXPORT_FORMAT.RAW,
      rawSpaceKey,
      { name: CRYPTO_CONFIG.ALGORITHMS.AES },
      false,
      ["encrypt"],
    );

    const iv = globalThis.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.IV_BYTES_LENGTH),
    );
    const ciphertext = await globalThis.crypto.subtle.encrypt(
      { name: CRYPTO_CONFIG.ALGORITHMS.AES, iv },
      aesKey,
      buffer,
    );

    return new Blob([iv, ciphertext], { type: "application/octet-stream" });
  },

  /**
   * Decrypts a Blob containing IV + Ciphertext using the AES-GCM Space Key.
   * Returns the decrypted ArrayBuffer.
   */
  decryptBuffer: async (
    encryptedBlob: Blob,
    base64SpaceKey: string,
  ): Promise<ArrayBuffer> => {
    const rawSpaceKey = cryptoService.decodeBase64(base64SpaceKey);
    const aesKey = await globalThis.crypto.subtle.importKey(
      CRYPTO_CONFIG.EXPORT_FORMAT.RAW,
      rawSpaceKey,
      { name: CRYPTO_CONFIG.ALGORITHMS.AES },
      false,
      ["decrypt"],
    );

    const buffer = await encryptedBlob.arrayBuffer();
    const iv = buffer.slice(0, CRYPTO_CONFIG.IV_BYTES_LENGTH);
    const ciphertext = buffer.slice(CRYPTO_CONFIG.IV_BYTES_LENGTH);

    return await globalThis.crypto.subtle.decrypt(
      { name: CRYPTO_CONFIG.ALGORITHMS.AES, iv: new Uint8Array(iv) },
      aesKey,
      ciphertext,
    );
  },
};
