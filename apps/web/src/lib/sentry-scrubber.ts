import type { Event } from "@sentry/nextjs";

const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|set-cookie|token|secret|service[-_]?key|api[-_]?key|password)/i;

const SENSITIVE_QUERY_KEYS = new Set([
  "accessToken",
  "access_token",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "key",
  "password",
  "refreshToken",
  "refresh_token",
  "serviceKey",
  "service_key",
  "token",
]);

type PlainRecord = Record<string, unknown>;

export function scrubSentryEvent<T extends Event>(event: T): T {
  const sanitized: Event = {
    ...event,
    extra: scrubUnknown(event.extra) as Event["extra"],
    contexts: scrubUnknown(event.contexts) as Event["contexts"],
    request: event.request ? { ...event.request } : undefined,
  };

  if (sanitized.request) {
    const request = sanitized.request as PlainRecord;
    request.headers = scrubHeaders(request.headers);
    request.url = scrubUrl(String(request.url ?? ""));
    request.query_string = scrubQueryString(request.query_string);
    delete request.cookies;
    delete request.data;
  }

  return sanitized as T;
}

export function scrubUrl(url: string) {
  if (!url) {
    return url;
  }

  try {
    const isAbsolute = /^[a-z][a-z\d+\-.]*:\/\//i.test(url);
    const parsedUrl = new URL(url, "http://localbiz-radar.local");
    for (const key of Array.from(parsedUrl.searchParams.keys())) {
      if (isSensitiveKey(key)) {
        parsedUrl.searchParams.delete(key);
      }
    }

    if (isAbsolute) {
      return parsedUrl.toString();
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return url.replace(/([?&][^=]*(token|key|password|cookie)[^=]*=)[^&]+/gi, "$1[Filtered]");
  }
}

export function safePathForSentry(path: string) {
  try {
    const parsedUrl = new URL(path, "http://localbiz-radar.local");
    return parsedUrl.pathname;
  } catch {
    return path.split("?")[0] ?? path;
  }
}

function scrubHeaders(headers: unknown) {
  if (!headers || typeof headers !== "object") {
    return headers;
  }

  return Object.fromEntries(
    Object.entries(headers as PlainRecord).filter(([key]) => !isSensitiveKey(key)),
  );
}

function scrubQueryString(queryString: unknown) {
  if (typeof queryString !== "string" || queryString.length === 0) {
    return queryString;
  }

  const params = new URLSearchParams(queryString);
  for (const key of Array.from(params.keys())) {
    if (isSensitiveKey(key)) {
      params.delete(key);
    }
  }
  return params.toString();
}

function scrubUnknown(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => scrubUnknown(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as PlainRecord)
      .filter(([key]) => !isSensitiveKey(key))
      .map(([key, nestedValue]) => [key, scrubUnknown(nestedValue)]),
  );
}

function isSensitiveKey(key: string) {
  return SENSITIVE_QUERY_KEYS.has(key) || SENSITIVE_KEY_PATTERN.test(key);
}
