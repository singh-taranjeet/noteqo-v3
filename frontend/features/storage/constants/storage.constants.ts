export const STORAGE_CONFIG = {
  DB_NAME: 'noteqo_db',
  DB_VERSION: 1,
  STORES: {
    KEYS: 'key_store',
  },
} as const;

export const STORAGE_KEYS = {
  MASTER_KEY: 'masterKey',
  PUBLIC_KEY: 'publicKey',
  PRIVATE_KEY: 'privateKey',
} as const;
