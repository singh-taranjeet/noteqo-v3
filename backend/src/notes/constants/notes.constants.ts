export const NOTE_TABLE = { NAME: 'notes' } as const;

export const NOTE_TYPE = {
  PRIVATE: 'private',
  SHARED: 'shared',
} as const;

export const NOTE_COLUMN = {
  ID: 'id',
  CIPHERTEXT: 'ciphertext',
  VERSION: 'version',
  SPACE_ID: 'space_id',
  TYPE: 'type',
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
