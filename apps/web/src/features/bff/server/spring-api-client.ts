import * as Sentry from "@sentry/nextjs";
import { BFF_ERROR_CODES, BffUpstreamError } from "@/features/bff/server/bff-error";
import { safePathForSentry } from "@/lib/sentry-scrubber";

const DEFAULT_SPRING_API_BASE_URL = "http://localhost:8080";

type SpringApiRequestInit = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export function getSpringApiBaseUrl() {
  return (
    process.env.SPRING_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_SPRING_API_BASE_URL
  ).replace(/\/$/, "");
}

export function springApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSpringApiBaseUrl()}${normalizedPath}`;
}

export async function springApiFetch<T>(
  path: string,
  init?: SpringApiRequestInit,
): Promise<T> {
  const safePath = safePathForSentry(path);
  Sentry.addBreadcrumb({
    category: "bff",
    message: "spring api fetch start",
    level: "info",
    data: { path: safePath },
  });

  let response: Response;
  try {
    response = await fetch(springApiUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      cache: init?.cache ?? "no-store",
    });
  } catch {
    Sentry.addBreadcrumb({
      category: "bff",
      message: "spring api fetch failed",
      level: "warning",
      data: { path: safePath, status: 502 },
    });
    throw new BffUpstreamError({
      message: "Spring Boot API에 연결하지 못했습니다.",
      status: 502,
      upstreamPath: path,
    });
  }

  if (!response.ok) {
    Sentry.addBreadcrumb({
      category: "bff",
      message: "spring api fetch failed",
      level: "warning",
      data: { path: safePath, status: response.status },
    });
    throw new BffUpstreamError({
      message: await readErrorMessage(response),
      status: response.status,
      upstreamPath: path,
      code:
        response.status === 401
          ? BFF_ERROR_CODES.UNAUTHORIZED
          : BFF_ERROR_CODES.UPSTREAM_ERROR,
    });
  }

  Sentry.addBreadcrumb({
    category: "bff",
    message: "spring api fetch succeeded",
    level: "info",
    data: { path: safePath, status: response.status },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Spring Boot API 요청에 실패했습니다.";
  } catch {
    return "Spring Boot API 요청에 실패했습니다.";
  }
}
