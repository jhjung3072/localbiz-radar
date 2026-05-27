import { apiClient } from "@/lib/api-client";
import type {
  MapStoreSearchParams,
  NearbyStoreSearchParams,
  StoreMapItem,
  StoreNearbyItem,
} from "@/features/map/types";

export function getMapStores(params: MapStoreSearchParams) {
  return apiClient<StoreMapItem[]>(
    `/api/stores/map?${toSearchParams(params).toString()}`,
  );
}

export function getNearbyStores(params: NearbyStoreSearchParams) {
  return apiClient<StoreNearbyItem[]>(
    `/api/stores/nearby?${toSearchParams(params).toString()}`,
  );
}

function toSearchParams(
  params: Record<string, string | number | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "all" && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}
