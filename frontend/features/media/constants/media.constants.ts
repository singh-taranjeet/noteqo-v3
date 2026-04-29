export const MEDIA_CONFIG = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  UPLOAD_FIELD_NAME: "file",
} as const;

export const MEDIA_MESSAGES = {
  FILE_TOO_LARGE: "File exceeds the 10 MB size limit.",
  UPLOAD_FAILED: "Failed to upload file.",
  DECRYPT_FAILED: "Failed to decrypt file.",
} as const;
