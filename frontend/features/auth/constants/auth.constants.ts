export const AUTH_API_ROUTES = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
} as const;

export const USER_API_ROUTES = {
  PUBLIC_KEY: "/users/public-key",
} as const;

export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  RECOVERY_FILE_NAME: "noteqo-recovery.txt",
  RECOVERY_FILE_TYPE: "text/plain",
} as const;

export const MOCK_USER = {
  NAME: "",
  AVATAR: "😎",
} as const;

export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  INVALID_MASTER_KEY:
    "Invalid master key provided. Please check it and try again.",
} as const;
