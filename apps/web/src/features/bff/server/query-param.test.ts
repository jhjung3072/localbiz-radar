import { describe, expect, it } from "vitest";
import {
  buildUrl,
  getNumberParam,
  pickSearchParams,
  toSearchParams,
} from "@/features/bff/server/query-param";

describe("BFF query param utilities", () => {
  it("serializes only meaningful values", () => {
    const params = toSearchParams({
      keyword: "커피",
      empty: "",
      all: "all",
      page: 0,
      enabled: true,
      missing: undefined,
    });

    expect(params.toString()).toBe("keyword=%EC%BB%A4%ED%94%BC&page=0&enabled=true");
  });

  it("picks whitelisted query values", () => {
    const params = new URLSearchParams("keyword=coffee&token=secret&page=2");

    expect(pickSearchParams(params, ["keyword", "page"])).toEqual({
      keyword: "coffee",
      page: "2",
    });
  });

  it("normalizes numeric params with fallback", () => {
    expect(getNumberParam(new URLSearchParams("page=3"), "page", 0)).toBe(3);
    expect(getNumberParam(new URLSearchParams("page=-1"), "page", 0)).toBe(0);
    expect(getNumberParam(new URLSearchParams("page=abc"), "page", 0)).toBe(0);
  });

  it("builds a path with query string only when needed", () => {
    expect(buildUrl("/api/stores", new URLSearchParams("page=0"))).toBe(
      "/api/stores?page=0",
    );
    expect(buildUrl("/api/stores", new URLSearchParams())).toBe("/api/stores");
  });
});
