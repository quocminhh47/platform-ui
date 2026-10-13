import type { ApiErrorBody } from '../types/api';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (typeof rawBaseUrl !== 'string' || rawBaseUrl.trim() === '') {
  throw new Error(
    'VITE_API_BASE_URL is not set. Copy .env.example to .env in the platform-ui project root',
  );
}

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type RequestOptions = {
  method?: string;
  body?: unknown;
  /** Bearer access token. Never pass passwords here. */
  accessToken?: string | null;
  headers?: Record<string, string>;
};

/**
 * Minimal fetch wrapper for the LMS API.
 * Callers supply a Bearer token when the route requires authentication.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const parsed: unknown = text ? safeJson(text) : null;

  if (!response.ok) {
    const errorBody =
      parsed && typeof parsed === 'object' ? (parsed as ApiErrorBody) : null;
    const message =
      errorBody?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, errorBody);
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
