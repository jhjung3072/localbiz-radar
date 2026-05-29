import { describe, expect, it, vi } from "vitest";
import { bffError } from "@/features/bff/server/bff-response";
import { BFF_ERROR_CODES, BffUpstreamError } from "@/features/bff/server/bff-error";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("BFF error response", () => {
  it("keeps unauthorized status from upstream", async () => {
    const response = bffError(
      new BffUpstreamError({
        code: BFF_ERROR_CODES.UNAUTHORIZED,
        message: "로그인이 필요합니다.",
        status: 401,
        upstreamPath: "/api/admin/ops/overview",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "로그인이 필요합니다.",
        status: 401,
      },
    });
    expect(response.status).toBe(401);
  });

  it("converts upstream server failure to a BFF 502 response", async () => {
    const response = bffError(
      new BffUpstreamError({
        message: "Upstream failed",
        status: 500,
        upstreamPath: "/api/stores?serviceKey=secret",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "BFF_UPSTREAM_ERROR",
        message: "데이터를 불러오지 못했습니다.",
        status: 500,
      },
    });
    expect(response.status).toBe(502);
  });
});
