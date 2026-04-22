export const USER_TABLE = { NAME: 'users' } as const;

export const USER_COLUMN = {
  ID: 'id',
  EMAIL: 'email',
  NAME: 'name',
  AUTH_CREDENTIAL: 'auth_credential',
  PUBLIC_KEY: 'public_key',
  PRIVATE_KEY: 'private_key',
} as const;

export const USER_ROUTES = {
  BASE: 'users',
  BY_ID: ':userId',
  PUBLIC_KEY: 'public-key',
} as const;

export const USER_ERROR_MESSAGES = {
  NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'A user with this email already exists',
} as const;

export const USER_CONSTANTS = {
  AUTH_SALT_ROUNDS: 10,
} as const;
