// Components
export { AuthGuard } from "./components/AuthGuard/AuthGuard";
export { LoginForm } from "./components/LoginForm/LoginForm";
export { RegisterForm } from "./components/RegisterForm/RegisterForm";
export { RecoveryCodeDialog } from "./components/RecoveryCodeDialog/RecoveryCodeDialog";

// Constants
export {
  AUTH_CONFIG,
  AUTH_API_ROUTES,
  MOCK_USER,
} from "./constants/auth.constants";

// Hooks
export { useAuthCheck } from "./hooks/useAuthCheck";
export { useLogin } from "./hooks/useLogin";
export { useLogout } from "./hooks/useLogout";
export { useRegister } from "./hooks/useRegister";
export { useUserProfile } from "./hooks/useUserProfile";
export type { UserProfile } from "./hooks/useUserProfile";

// Services
export { authService } from "./services/auth.service";
export { KeysService } from "./services/keys.service";
export { userApiService } from "./services/user-api.service";

// Types
export type {
  User,
  AuthResponse,
  RegisterRequestPayload,
  LoginRequestPayload,
} from "./types/auth.types";
