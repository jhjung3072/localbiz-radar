import { apiClient } from "@/lib/api-client";
import type {
  AnalysisFilterParams,
  AnalysisSummary,
  CategoryDistributionItem,
  CategoryDistributionParams,
  CompareAnalysisPayload,
  CompareAnalysisResult,
  Competition,
  CompetitionParams,
} from "@/features/analysis/types";

export function getAnalysisSummary(params: AnalysisFilterParams) {
  return apiClient<AnalysisSummary>(
    `/api/analysis/summary?${toSearchParams(params).toString()}`,
  );
}

export function getCategoryDistribution(params: CategoryDistributionParams) {
  return apiClient<CategoryDistributionItem[]>(
    `/api/analysis/category-distribution?${toSearchParams(params).toString()}`,
  );
}

export function getCompetition(params: CompetitionParams) {
  return apiClient<Competition>(
    `/api/analysis/competition?${toSearchParams(params).toString()}`,
  );
}

export function compareAnalysis(payload: CompareAnalysisPayload) {
  return apiClient<CompareAnalysisResult>("/api/analysis/compare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
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
