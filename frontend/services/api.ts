import { API_BASE_URL } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { KeysService } from "@/features/auth";
import { storageService, STORAGE_KEYS } from "@/features/storage";
import { LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED } from "@/features/spaces";
import { logService } from "./log.service";

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
    } else {
      KeysService.clear(false).then(() => {
        // Clear the inti localstorage option as well
        localStorage.removeItem(LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED);
      });
      window.location.href = ROUTES.LOGIN;
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      await KeysService.clear(false);
      // Clear the inti localstorage option as well
      localStorage.removeItem(LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED);
      window.location.href = ROUTES.LOGIN;
    }

    const errorBody = await response.json().catch(() => null);
    logService.error(
      `${errorBody?.message} || HTTP error! status: ${response.status}`,
    );
    // throw new Error(`Please try agin`);
  }

  // Handle empty responses
  try {
    const text = await response?.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
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
    if (response.status === 401 && typeof window !== "undefined") {
      await KeysService.clear(false);
      window.location.href = ROUTES.LOGIN;
    }

    const errorBody = await response.json().catch(() => null);
    logService.error(
      `${errorBody?.message} || HTTP error! status: ${response.status}`,
    );
    // throw new Error(`Please try agin`);
  }

  try {
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}
