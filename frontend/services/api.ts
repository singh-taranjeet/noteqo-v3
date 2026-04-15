import { API_BASE_URL } from '@/constants/config';

export const apiClient = {
  get: async <T>(url: string, init?: RequestInit): Promise<T> => request<T>(url, { ...init, method: 'GET' }),
  post: async <T>(url: string, body?: unknown, init?: RequestInit): Promise<T> => request<T>(url, { ...init, method: 'POST', body: JSON.stringify(body) }),
  patch: async <T>(url: string, body?: unknown, init?: RequestInit): Promise<T> => request<T>(url, { ...init, method: 'PATCH', body: JSON.stringify(body) }),
  delete: async <T>(url: string, init?: RequestInit): Promise<T> => request<T>(url, { ...init, method: 'DELETE' }),
};

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}
