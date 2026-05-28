import { describe, expect, it } from "vitest";
import {
  mapQueryKeys,
  normalizeMapStoreSearchParams,
  normalizeNearbyStoreSearchParams,
} from "./map-query-keys";

describe("map query keys", () => {
  it("normalizes viewport params for stable marker query keys", () => {
    const normalized = normalizeMapStoreSearchParams({
      sido: "all",
      sigungu: "강남구",
      categoryLargeCode: "I2",
      minLat: 37.123456789,
      maxLat: 37.987654321,
      minLng: 127.123456789,
      maxLng: 127.987654321,
      limit: 3000,
    });

    expect(normalized).toMatchObject({
      sido: undefined,
      sigungu: "강남구",
      categoryLargeCode: "I2",
      minLat: 37.123457,
      maxLat: 37.987654,
      minLng: 127.123457,
      maxLng: 127.987654,
      limit: 1000,
    });
    expect(mapQueryKeys.stores(normalized)).toEqual(mapQueryKeys.stores(normalized));
  });

  it("normalizes nearby params for stable radius query keys", () => {
    const normalized = normalizeNearbyStoreSearchParams({
      lat: 37.123456789,
      lng: 127.123456789,
      radius: 10,
      categoryLargeCode: "all",
      limit: 1000,
    });

    expect(normalized).toEqual({
      lat: 37.123457,
      lng: 127.123457,
      radius: 100,
      categoryLargeCode: undefined,
      categoryMediumCode: undefined,
      categorySmallCode: undefined,
      limit: 500,
    });
  });
});
