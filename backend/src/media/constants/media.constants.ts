export const MEDIA_TABLE = {
  NAME: 'media',
  COLUMN: {
    NOTE_ID: 'note_id',
    SPACE_ID: 'space_id',
    MIME_TYPE: 'mime_type',
    SIZE_BYTES: 'size_bytes',
    URL: 'url',
    META: 'meta',
  },
} as const;

export const MEDIA_ROUTES = {
  BASE: 'media',
  BY_ID: ':mediaId',
} as const;

export const MEDIA_CONFIG = {
  /** Maximum file size in bytes (100 MB) */
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024,
  UPLOAD_FIELD_NAME: 'file',
  STORAGE_PREFIX: 'media',
  DEFAULT_CONTENT_TYPE: 'application/octet-stream',
  VERCEL_BLOB_ACCESS: 'public',
} as const;
