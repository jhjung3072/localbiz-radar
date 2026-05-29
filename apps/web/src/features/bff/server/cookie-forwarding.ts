const COOKIE_HEADER = "cookie";

export function cookieForwardingHeaders(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return {
    [COOKIE_HEADER]: cookieHeader,
  };
}

export function hasAuthCookie(cookieHeader: string | null) {
  return Boolean(cookieHeader?.includes("LOCALBIZ_ACCESS_TOKEN="));
}
