import { CRYPTO_CONFIG } from "../constants/crypto.constants";

/**
 * Utility functions for generating and managing E2E encryption keys.
 * This is client-side only (requires window.crypto).
 */

// Removed internal base64 helpers to expose them directly on cryptoService

export const cryptoService = {
  /**
   * Generates a 256-bit symmetric key acting as the Master Key / Recovery Code.
   * Returns a base64 string.
   */
  generateMasterKey: (): string => {
    const randomBytes = window.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.MASTER_KEY_BYTES_LENGTH),
    );
    return cryptoService.encodeBase64(randomBytes.buffer);
  },

  /**
   * Generates a 256-bit symmetric document key. Returns a base64 string.
   */
  generateDocumentKey: (): string => {
    const randomBytes = window.crypto.getRandomValues(
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
    return window.btoa(binary);
  },

  decodeBase64: (base64: string): ArrayBuffer => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },

  /**
   * Generates an RSA-OAEP Key Pair.
   * Exports the public and private keys in JWK format.
   */
  generateKeyPair: async (): Promise<{
    publicKey: string;
    privateKey: string;
  }> => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: CRYPTO_CONFIG.ALGORITHMS.RSA,
        modulusLength: CRYPTO_CONFIG.RSA_MODULUS_LENGTH,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: CRYPTO_CONFIG.ALGORITHMS.HASH,
      },
      true, // extractable
      ["encrypt", "decrypt"],
    );

    const exportedPublicKey = await window.crypto.subtle.exportKey(
      CRYPTO_CONFIG.EXPORT_FORMAT.JWK,
      keyPair.publicKey,
    );
    const exportedPrivateKey = await window.crypto.subtle.exportKey(
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
    // 1. Import Master Key
    const rawKey = cryptoService.decodeBase64(base64MasterKey);
    const cryptoKey = await window.crypto.subtle.importKey(
      CRYPTO_CONFIG.EXPORT_FORMAT.RAW,
      rawKey,
      { name: CRYPTO_CONFIG.ALGORITHMS.AES },
      false,
      ["encrypt"],
    );

    // 2. Prepare payload
    const encoder = new TextEncoder();
    const data = encoder.encode(privateKeyPayload);

    // 3. Encrypt
    const iv = window.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.IV_BYTES_LENGTH),
    );
    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: CRYPTO_CONFIG.ALGORITHMS.AES,
        iv: iv,
      },
      cryptoKey,
      data,
    );

    // 4. Combine IV and Ciphertext as base64 strings separated by a colon
    const encodedIv = cryptoService.encodeBase64(iv.buffer);
    const encodedCiphertext = cryptoService.encodeBase64(encryptedContent);

    return `${encodedIv}:${encodedCiphertext}`;
  },
};
