export const AUTH_ROUTES = {
  BASE: 'auth',
  REGISTER: 'register',
  LOGIN: 'login',
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  AUTH_REQUIRED: 'Authentication required',
} as const;
