import type {
  MapStoreSearchParams,
  NearbyStoreSearchParams,
} from "@/features/map/types";

export const mapQueryKeys = {
  all: ["map"] as const,
  stores: (params: MapStoreSearchParams) =>
    [...mapQueryKeys.all, "stores", params] as const,
  nearby: (params: NearbyStoreSearchParams | null) =>
    [...mapQueryKeys.all, "nearby", params] as const,
};
