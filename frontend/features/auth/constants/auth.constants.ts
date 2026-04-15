export const AUTH_API_ROUTES = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
} as const;

export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  RECOVERY_FILE_NAME: 'noteqo-recovery.txt',
  RECOVERY_FILE_TYPE: 'text/plain',
} as const;
