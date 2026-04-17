import { apiClient } from '@/services/api';
import { AUTH_API_ROUTES } from '../constants/auth.constants';
import type { RegisterRequestPayload, LoginRequestPayload, AuthResponse } from '../types/auth.types';

export const authService = {
  register: (payload: RegisterRequestPayload) => {
    return apiClient.post<AuthResponse>(AUTH_API_ROUTES.REGISTER, payload);
  },

  login: (payload: LoginRequestPayload) => {
    return apiClient.post<AuthResponse>(AUTH_API_ROUTES.LOGIN, payload);
  },
};
