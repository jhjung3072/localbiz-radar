import { describe, expect, it } from "vitest";
import { normalizeStoreSearchParams, storeQueryKeys } from "./store-query-keys";

describe("store query keys", () => {
  it("normalizes search params for stable query keys", () => {
    const normalized = normalizeStoreSearchParams({
      keyword: " 커피 ",
      sido: "all",
      sigungu: "강남구",
      dong: "",
      categoryLargeCode: "I2",
      categoryMediumCode: "all",
      categorySmallCode: undefined,
      page: -1,
      size: 500,
    });

    expect(normalized).toEqual({
      keyword: "커피",
      sido: undefined,
      sigungu: "강남구",
      dong: undefined,
      categoryLargeCode: "I2",
      categoryMediumCode: undefined,
      categorySmallCode: undefined,
      page: 0,
      size: 100,
    });
    expect(storeQueryKeys.list(normalized)).toEqual(storeQueryKeys.list(normalized));
  });
});
