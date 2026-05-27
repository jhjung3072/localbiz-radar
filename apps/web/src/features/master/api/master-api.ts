import { apiClient } from "@/lib/api-client";
import type {
  CategoryMasterSyncPayload,
  MasterCategory,
  MasterDataStatus,
  MasterRegion,
  MasterSyncResult,
  RegionMasterSyncPayload,
} from "@/features/master/types";

export function getMasterRegions() {
  return apiClient<MasterRegion[]>("/api/master/regions");
}

export function getMasterCategories() {
  return apiClient<MasterCategory[]>("/api/master/categories");
}

export function getMasterSyncStatus() {
  return apiClient<MasterDataStatus>("/api/admin/sync/master/status");
}

export function syncRegionMasters(payload: RegionMasterSyncPayload) {
  return apiClient<MasterSyncResult>("/api/admin/sync/master/regions/openapi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function syncCategoryMasters(payload: CategoryMasterSyncPayload) {
  return apiClient<MasterSyncResult>("/api/admin/sync/master/categories/openapi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
