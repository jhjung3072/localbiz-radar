import { apiClient } from "@/lib/api-client";
import type {
  CompareRegionsPayload,
  CompareRegionsResult,
  RegionRankingItem,
  RegionRankingParams,
} from "@/features/compare/types";

export function compareRegions(payload: CompareRegionsPayload) {
  return apiClient<CompareRegionsResult>("/api/analysis/compare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function getRegionRanking(params: RegionRankingParams) {
  return apiClient<RegionRankingItem[]>(
    `/api/analysis/region-ranking?${toSearchParams(params).toString()}`,
  );
}

function toSearchParams(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "all" && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}
