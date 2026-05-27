import type {
  AnalysisFilterParams,
  CategoryDistributionParams,
  CompareAnalysisPayload,
  CompetitionParams,
} from "@/features/analysis/types";

export const analysisQueryKeys = {
  all: ["analysis"] as const,
  summary: (params: AnalysisFilterParams) =>
    [...analysisQueryKeys.all, "summary", params] as const,
  categoryDistribution: (params: CategoryDistributionParams) =>
    [...analysisQueryKeys.all, "category-distribution", params] as const,
  competition: (params: CompetitionParams) =>
    [...analysisQueryKeys.all, "competition", params] as const,
  compare: (payload: CompareAnalysisPayload) =>
    [...analysisQueryKeys.all, "compare", payload] as const,
};
