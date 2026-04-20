export const NOTE_TABLE = { NAME: 'notes' } as const;

export const KEY_SLOT_TABLE = { NAME: 'key_slots' } as const;

export const NOTE_COLUMN = {
  ID: 'id',
  CIPHERTEXT: 'ciphertext',
  VERSION: 'version',
} as const;

export const KEY_SLOT_COLUMN = {
  NOTE_ID: 'note_id',
  USER_ID: 'user_id',
  ENCRYPTED_NOTE_KEY: 'encrypted_note_key',
} as const;

export const NOTE_VERSION_TABLE = { NAME: 'note_versions' } as const;

export const NOTE_VERSION_COLUMN = {
  ID: 'id',
  NOTE_ID: 'note_id',
  CIPHERTEXT: 'ciphertext',
  VERSION: 'version',
} as const;

export const NOTE_ROUTES = {
  BASE: 'notes',
  BY_ID: ':noteId',
} as const;

export const NOTE_ERROR_MESSAGES = {
  NOT_FOUND: 'Note not found',
  PERMISSION_DENIED: 'Permission denied for this note.',
} as const;
