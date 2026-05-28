import * as Sentry from "@sentry/nextjs";
import { safePathForSentry } from "@/lib/sentry-scrubber";

const DEFAULT_API_BASE_URL = "http://localhost:8080";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

type ApiRequestInit = RequestInit & {
  skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

export async function apiClient<T>(
  path: string,
  init?: ApiRequestInit,
): Promise<T> {
  const response = await apiFetch(path, init);

  if (!response.ok) {
    const message = await readErrorMessage(response);
    captureApiFailure(path, response.status, message);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiFetch(
  path: string,
  init?: ApiRequestInit,
): Promise<Response> {
  const response = await fetchWithDefaults(path, init);

  if (response.status !== 401 || init?.skipAuthRefresh || !shouldRefresh(path)) {
    return response;
  }

  const refreshed = await refreshSession();
  if (refreshed) {
    return fetchWithDefaults(path, init);
  }

  if (typeof window !== "undefined" && path.startsWith("/api/admin/")) {
    redirectToLogin();
  }

  return response;
}

async function fetchWithDefaults(path: string, init?: ApiRequestInit) {
  const requestInit = { ...(init ?? {}) };
  delete requestInit.skipAuthRefresh;
  try {
    return await fetch(`${getApiBaseUrl()}${path}`, {
      ...requestInit,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...requestInit.headers,
      },
    });
  } catch (error) {
    captureNetworkFailure(path, error);
    throw error;
  }
}

function shouldRefresh(path: string) {
  return ![
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/logout",
  ].includes(path);
}

async function refreshSession() {
  refreshPromise ??= fetchWithDefaults("/api/auth/refresh", {
    method: "POST",
    skipAuthRefresh: true,
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function redirectToLogin() {
  const next = `${window.location.pathname}${window.location.search}`;
  const loginUrl = `/admin/login?next=${encodeURIComponent(next)}`;
  if (!window.location.pathname.startsWith("/admin/login")) {
    window.location.assign(loginUrl);
  }
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "API 요청에 실패했습니다.";
  } catch {
    return "API 요청에 실패했습니다.";
  }
}

function captureApiFailure(path: string, status: number, message: string) {
  if (status < 500) {
    return;
  }

  const safePath = safePathForSentry(path);
  Sentry.captureMessage("Spring Boot API request failed", {
    level: "error",
    tags: {
      apiPath: safePath,
      httpStatus: String(status),
    },
    extra: {
      apiPath: safePath,
      status,
      message,
    },
  });
}

function captureNetworkFailure(path: string, error: unknown) {
  const safePath = safePathForSentry(path);
  Sentry.captureException(error, {
    tags: {
      apiPath: safePath,
      failureType: "network",
    },
    extra: {
      apiPath: safePath,
    },
  });
}
