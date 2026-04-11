export const USER_TABLE = { NAME: 'users' } as const;

export const USER_COLUMN = {
  ID: 'id',
  EMAIL: 'email',
  NAME: 'name',
  PASSWORD: 'password',
} as const;

export const USER_ROUTES = {
  BASE: 'users',
  BY_ID: ':userId',
} as const;

export const USER_ERROR_MESSAGES = {
  NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'A user with this email already exists',
} as const;

export const USER_CONSTANTS = {
  PASSWORD_SALT_ROUNDS: 10,
} as const;
