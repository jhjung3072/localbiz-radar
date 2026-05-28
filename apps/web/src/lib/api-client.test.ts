import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";

describe("apiClient", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends credentials with API requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ status: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await apiClient("/api/health");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/health",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("refreshes once and retries the original request after 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: "로그인이 필요합니다." }, 401))
      .mockResolvedValueOnce(jsonResponse({ user: { username: "admin" } }))
      .mockResolvedValueOnce(jsonResponse({ content: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient("/api/admin/sync/logs")).resolves.toEqual({
      content: [],
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/api/auth/refresh",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
