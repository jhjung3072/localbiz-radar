import type {
  MapStoreSearchParams,
  NearbyStoreSearchParams,
} from "@/features/map/types";

export const mapQueryKeys = {
  all: ["map"] as const,
  stores: (params: MapStoreSearchParams) =>
    [...mapQueryKeys.all, "stores", normalizeMapStoreSearchParams(params)] as const,
  nearby: (params: NearbyStoreSearchParams | null) =>
    [
      ...mapQueryKeys.all,
      "nearby",
      params ? normalizeNearbyStoreSearchParams(params) : null,
    ] as const,
};

export function normalizeMapStoreSearchParams(
  params: MapStoreSearchParams,
): MapStoreSearchParams {
  return {
    sido: normalizeSelect(params.sido),
    sigungu: normalizeSelect(params.sigungu),
    dong: normalizeSelect(params.dong),
    categoryLargeCode: normalizeSelect(params.categoryLargeCode),
    categoryMediumCode: normalizeSelect(params.categoryMediumCode),
    categorySmallCode: normalizeSelect(params.categorySmallCode),
    minLat: normalizeCoordinate(params.minLat),
    maxLat: normalizeCoordinate(params.maxLat),
    minLng: normalizeCoordinate(params.minLng),
    maxLng: normalizeCoordinate(params.maxLng),
    limit: Math.min(Math.max(params.limit ?? 300, 1), 1000),
  };
}

export function normalizeNearbyStoreSearchParams(
  params: NearbyStoreSearchParams,
): NearbyStoreSearchParams {
  return {
    lat: normalizeCoordinate(params.lat) ?? params.lat,
    lng: normalizeCoordinate(params.lng) ?? params.lng,
    radius: Math.min(Math.max(params.radius ?? 500, 100), 3000),
    categoryLargeCode: normalizeSelect(params.categoryLargeCode),
    categoryMediumCode: normalizeSelect(params.categoryMediumCode),
    categorySmallCode: normalizeSelect(params.categorySmallCode),
    limit: Math.min(Math.max(params.limit ?? 100, 1), 500),
  };
}

function normalizeSelect(value?: string) {
  return value && value !== "all" ? value : undefined;
}

function normalizeCoordinate(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return Number(value.toFixed(6));
}
