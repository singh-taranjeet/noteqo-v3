import { API_BASE_URL } from "@/constants/config";
import { storageService, STORAGE_KEYS } from "@/features/storage";

export interface ApiRequestInit extends RequestInit {
  auth?: boolean;
}

export const apiClient = {
  get: async <T>(url: string, init?: ApiRequestInit): Promise<T> =>
    request<T>(url, { ...init, method: "GET" }),
  post: async <T>(
    url: string,
    body?: unknown,
    init?: ApiRequestInit,
  ): Promise<T> =>
    request<T>(url, { ...init, method: "POST", body: JSON.stringify(body) }),
  patch: async <T>(
    url: string,
    body?: unknown,
    init?: ApiRequestInit,
  ): Promise<T> =>
    request<T>(url, { ...init, method: "PATCH", body: JSON.stringify(body) }),
  delete: async <T>(url: string, init?: ApiRequestInit): Promise<T> =>
    request<T>(url, { ...init, method: "DELETE" }),
  postForm: async <T>(
    url: string,
    formData: FormData,
    init?: ApiRequestInit,
  ): Promise<T> => requestForm<T>(url, formData, { ...init, method: "POST" }),
};

async function request<T>(url: string, init: ApiRequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (init.auth) {
    const token = await storageService.get<string>(STORAGE_KEYS.JWT_KEY);

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message || `HTTP error! status: ${response.status}`,
    );
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

async function requestForm<T>(
  url: string,
  formData: FormData,
  init: ApiRequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  if (init.auth) {
    const token = await storageService.get<string>(STORAGE_KEYS.JWT_KEY);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...init,
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message || `HTTP error! status: ${response.status}`,
    );
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}
