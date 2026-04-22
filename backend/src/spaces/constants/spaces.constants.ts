// ─── Domain Values ───────────────────────────────────────────────────────────

export const SPACE_TYPE = {
  PERSONAL: 'personal',
  SHARED: 'shared',
} as const;

export const SPACE_ROLE = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer'
} as const;

// ─── DB Table Names ──────────────────────────────────────────────────────────

export const SPACE_TABLE = { NAME: 'spaces' } as const;

export const SPACE_MEMBER_TABLE = { NAME: 'space_members' } as const;

export const SPACE_KEY_SLOT_TABLE = { NAME: 'space_key_slots' } as const;

// ─── DB Column Names ─────────────────────────────────────────────────────────

export const SPACE_COLUMN = {
  ID: 'id',
  ENCRYPTED_NAME: 'encrypted_name',
  TYPE: 'type',
} as const;

export const SPACE_MEMBER_COLUMN = {
  SPACE_ID: 'space_id',
  USER_ID: 'user_id',
  ROLE: 'role',
} as const;

export const SPACE_KEY_SLOT_COLUMN = {
  SPACE_ID: 'space_id',
  USER_ID: 'user_id',
  ENCRYPTED_SPACE_KEY: 'encrypted_space_key',
} as const;

// ─── Relations ───────────────────────────────────────────────────────────────

export const SPACE_RELATIONS = {
  MEMBERS: ['members'] as const,
  KEY_SLOTS: ['keySlots'] as const,
  FULL: ['members', 'keySlots'] as const,
} as const;

// ─── HTTP Routes ─────────────────────────────────────────────────────────────

export const SPACE_ROUTES = {
  BASE: 'spaces',
  BY_ID: ':spaceId',
  MEMBERS: ':spaceId/members',
  MEMBER_BY_ID: ':spaceId/members/:userId',
  NOTES: ':spaceId/notes',
  NOTE_BY_ID: ':spaceId/notes/:noteId',
} as const;

// ─── Error Messages ──────────────────────────────────────────────────────────

export const SPACE_ERROR_MESSAGES = {
  NOT_FOUND: 'Space not found',
  ALREADY_EXISTS: 'A space with this name already exists',
  PERMISSION_DENIED: 'You do not have permission to perform this action on this space',
  OWNER_KEY_SLOT_REQUIRED: 'Owner key slot is required for shared spaces',
  OWNER_KEY_SLOT_FORBIDDEN: 'Owner key slot must not be provided for personal spaces',
  CANNOT_ADD_MEMBER_TO_PERSONAL: 'Cannot add members to a personal space',
  CANNOT_REMOVE_OWNER: 'Cannot remove the owner from a space',
  MEMBER_ALREADY_EXISTS: 'This user is already a member of this space',
  MEMBER_NOT_FOUND: 'Member not found in this space',
  USER_NOT_FOUND: 'The invited user was not found',
  NOTE_KEY_REQUIRED_FOR_PERSONAL: 'Encrypted note key is required for personal space notes',
  NOTE_KEY_FORBIDDEN_FOR_SHARED: 'Encrypted note key must not be provided for shared space notes',
} as const;
