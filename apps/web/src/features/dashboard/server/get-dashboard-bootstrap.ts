import type { DashboardBffData } from "@/features/bff/server/types";
import { buildUrl, toSearchParams } from "@/features/bff/server/query-param";
import { springApiFetch } from "@/features/bff/server/spring-api-client";
import type {
  AnalysisFilterParams,
  AnalysisSummary,
  CategoryDistributionItem,
} from "@/features/analysis/types";
import type { RegionRankingItem } from "@/features/compare/types";

export async function getDashboardBootstrap(
  params: AnalysisFilterParams = { sido: "서울특별시" },
): Promise<DashboardBffData> {
  const summaryParams = toSearchParams(params);
  const distributionParams = toSearchParams({ ...params, depth: "small" });
  const rankingParams = toSearchParams({
    ctprvnCd: "11",
    groupBy: "SIGUNGU",
    categoryLargeCode: params.categoryLargeCode,
    categoryMediumCode: params.categoryMediumCode,
    categorySmallCode: params.categorySmallCode,
    limit: 5,
  });

  const [summary, categoryDistribution, regionRanking] = await Promise.all([
    springApiFetch<AnalysisSummary>(
      buildUrl("/api/analysis/summary", summaryParams),
    ),
    springApiFetch<CategoryDistributionItem[]>(
      buildUrl("/api/analysis/category-distribution", distributionParams),
    ),
    springApiFetch<RegionRankingItem[]>(
      buildUrl("/api/analysis/region-ranking", rankingParams),
    ).catch(() => []),
  ]);

  return {
    summary,
    categoryDistribution,
    regionRanking,
    generatedAt: new Date().toISOString(),
  };
}
