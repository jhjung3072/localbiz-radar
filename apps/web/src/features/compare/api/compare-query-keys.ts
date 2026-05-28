import type {
  CompareRegionsPayload,
  RegionRankingParams,
} from "@/features/compare/types";

export const compareQueryKeys = {
  all: ["compare"] as const,
  result: (payload: CompareRegionsPayload) =>
    [...compareQueryKeys.all, "result", payload] as const,
  ranking: (params: RegionRankingParams) =>
    [...compareQueryKeys.all, "ranking", params] as const,
};
