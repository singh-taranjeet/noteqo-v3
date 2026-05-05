export const STORAGE_CONFIG = {
  DB_NAME: "noteqo_db",
  DB_VERSION: 72,
  STORES: {
    KEYS: "key_store",
    DOCUMENTS: "documents",
    SYNC_QUEUE: "sync_queue",
    MEDIA: "media",
  },
} as const;

export const STORAGE_KEYS = {
  MASTER_KEY: "masterKey",
  PUBLIC_KEY: "publicKey",
  PRIVATE_KEY: "privateKey",
  JWT_KEY: "jwtKey",
  USER_PROFILE: "userProfile",
} as const;
