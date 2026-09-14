const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cbe_auth_token');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cbe_auth_token', token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cbe_auth_token');
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (typeof data === 'object' && (data?.error?.message || data?.message)) ||
      `Request failed with status ${response.status}`;
    const code = typeof data === 'object' ? data?.error?.code : undefined;
    const details = typeof data === 'object' ? data?.error?.details : undefined;

    throw new ApiError(message, response.status, code, details);
  }

  return data as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
