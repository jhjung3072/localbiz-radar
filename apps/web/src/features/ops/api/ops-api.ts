import { apiClient } from "@/lib/api-client";
import type {
  OpsDataQuality,
  OpsOverview,
  OpsSyncSummary,
} from "@/features/ops/types";

export function getOpsOverview() {
  return apiClient<OpsOverview>("/api/admin/ops/overview");
}

export function getOpsSyncSummary(days = 7) {
  return apiClient<OpsSyncSummary>(`/api/admin/ops/sync-summary?days=${days}`);
}

export function getOpsDataQuality() {
  return apiClient<OpsDataQuality>("/api/admin/ops/data-quality");
}
