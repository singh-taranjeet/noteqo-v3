export const CRYPTO_CONFIG = {
  ALGORITHMS: {
    RSA: 'RSA-OAEP',
    HASH: 'SHA-256',
    AES: 'AES-GCM',
  },
  RSA_MODULUS_LENGTH: 2048,
  MASTER_KEY_BYTES_LENGTH: 32,
  IV_BYTES_LENGTH: 12,
  EXPORT_FORMAT: {
    JWK: 'jwk' as const,
    RAW: 'raw' as const,
  },
} as const;
