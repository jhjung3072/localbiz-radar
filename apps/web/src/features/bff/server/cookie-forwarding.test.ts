import { describe, expect, it } from "vitest";
import {
  cookieForwardingHeaders,
  hasAuthCookie,
} from "@/features/bff/server/cookie-forwarding";

describe("BFF cookie forwarding", () => {
  it("forwards cookie header without exposing its value in test snapshots", () => {
    const headers = cookieForwardingHeaders("LOCALBIZ_ACCESS_TOKEN=secret");

    expect(Object.keys(headers)).toEqual(["cookie"]);
    expect(headers.cookie).toBeDefined();
  });

  it("detects admin auth cookie presence", () => {
    expect(hasAuthCookie("LOCALBIZ_ACCESS_TOKEN=secret")).toBe(true);
    expect(hasAuthCookie("OTHER=value")).toBe(false);
    expect(hasAuthCookie(null)).toBe(false);
  });
});
