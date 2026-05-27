import type {
  CategoryMasterSyncPayload,
  RegionMasterSyncPayload,
} from "@/features/master/types";

export const masterQueryKeys = {
  all: ["master"] as const,
  regions: () => [...masterQueryKeys.all, "regions"] as const,
  categories: () => [...masterQueryKeys.all, "categories"] as const,
  status: () => [...masterQueryKeys.all, "status"] as const,
  regionSync: (payload: RegionMasterSyncPayload) =>
    [...masterQueryKeys.all, "region-sync", payload] as const,
  categorySync: (payload: CategoryMasterSyncPayload) =>
    [...masterQueryKeys.all, "category-sync", payload] as const,
};
