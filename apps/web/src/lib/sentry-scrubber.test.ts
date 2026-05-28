import { describe, expect, it } from "vitest";
import { scrubSentryEvent, scrubUrl, safePathForSentry } from "@/lib/sentry-scrubber";

describe("sentry scrubber", () => {
  it("removes sensitive request headers and cookies", () => {
    const event = scrubSentryEvent({
      request: {
        url: "https://example.com/api/admin/sync?serviceKey=secret&page=1",
        headers: {
          Cookie: "LOCALBIZ_ACCESS_TOKEN=secret",
          Authorization: "Bearer secret",
          Accept: "application/json",
        },
        cookies: {
          LOCALBIZ_REFRESH_TOKEN: "secret",
        },
      },
    });

    expect(event.request?.url).toBe("https://example.com/api/admin/sync?page=1");
    expect(event.request?.headers).toEqual({ Accept: "application/json" });
    expect("cookies" in (event.request ?? {})).toBe(false);
  });

  it("scrubs sensitive query values", () => {
    expect(scrubUrl("/api/stores?keyword=cafe&token=secret")).toBe(
      "/api/stores?keyword=cafe",
    );
  });

  it("keeps only the path for api breadcrumbs and captured API errors", () => {
    expect(safePathForSentry("/api/stores?keyword=very-sensitive")).toBe(
      "/api/stores",
    );
  });
});
