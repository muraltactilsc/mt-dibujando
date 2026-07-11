const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface ApiOptions {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

interface AuthHandlers {
  getAccessToken: () => string | null;
  refreshSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}

let authHandlers: AuthHandlers | null = null;

export function registerAuthHandlers(handlers: AuthHandlers): void {
  authHandlers = handlers;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}

function getAuthHeaders(options: ApiOptions): Record<string, string> {
  if (options.skipAuth) {
    return {};
  }
  const accessToken = authHandlers?.getAccessToken() ?? null;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

async function parseError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => ({}))) as Partial<ErrorEnvelope>;
  const message = body.error?.message ?? `Request failed: ${response.statusText}`;
  return new ApiError(message, response.status, body.error?.code);
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  options: ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...getAuthHeaders(options),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await parseError(response);

    if (response.status === 401 && !options.skipRefresh && authHandlers) {
      const errorCode = error.code;
      if (errorCode === 'unauthenticated' || errorCode === 'session_invalidated') {
        try {
          await authHandlers.refreshSession();
          return apiRequest(method, path, body, { ...options, skipRefresh: true });
        } catch {
          await authHandlers.clearSession();
        }
      }
    }

    throw error;
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string, options?: ApiOptions): Promise<T> {
  return apiRequest<T>('GET', path, undefined, options);
}

export function apiPost<T>(path: string, body: unknown, options?: ApiOptions): Promise<T> {
  return apiRequest<T>('POST', path, body, options);
}
