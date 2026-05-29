import type {
  CompareBootstrapData,
} from "@/features/bff/server/types";
import { buildUrl, toSearchParams } from "@/features/bff/server/query-param";
import { springApiFetch } from "@/features/bff/server/spring-api-client";
import { getExploreBootstrap } from "@/features/explore/server/get-explore-bootstrap";
import type { RegionRankingItem, RegionRankingParams } from "@/features/compare/types";

export async function getCompareBootstrap(
  params: RegionRankingParams = {},
): Promise<CompareBootstrapData> {
  const normalizedParams: RegionRankingParams = {
    ctprvnCd: params.ctprvnCd ?? "11",
    signguCd: params.signguCd,
    groupBy: params.groupBy ?? "SIGUNGU",
    indsLclsCd: params.indsLclsCd,
    indsMclsCd: params.indsMclsCd,
    indsSclsCd: params.indsSclsCd,
    limit: params.limit ?? 10,
  };
  const rankingParams = toSearchParams({
    ctprvnCd: normalizedParams.ctprvnCd,
    signguCd: normalizedParams.signguCd,
    groupBy: normalizedParams.groupBy,
    indsLclsCd: normalizedParams.indsLclsCd,
    indsMclsCd: normalizedParams.indsMclsCd,
    indsSclsCd: normalizedParams.indsSclsCd,
    limit: normalizedParams.limit,
  });

  const [bootstrap, regionRanking] = await Promise.all([
    getExploreBootstrap(),
    springApiFetch<RegionRankingItem[]>(
      buildUrl("/api/analysis/region-ranking", rankingParams),
    ),
  ]);

  return {
    regions: bootstrap.regions,
    categories: bootstrap.categories,
    regionRanking,
    rankingParams: normalizedParams,
    generatedAt: new Date().toISOString(),
  };
}
