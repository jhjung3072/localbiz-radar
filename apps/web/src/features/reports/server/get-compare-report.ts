import * as Sentry from "@sentry/nextjs";
import { BFF_ERROR_CODES, BffUpstreamError } from "@/features/bff/server/bff-error";
import { buildUrl, toSearchParams } from "@/features/bff/server/query-param";
import { springApiFetch } from "@/features/bff/server/spring-api-client";
import type {
  CompareRegionsResult,
  RegionRankingItem,
} from "@/features/compare/types";
import { getExploreBootstrap } from "@/features/explore/server/get-explore-bootstrap";
import { parseCompareReportSearchParams } from "@/features/reports/api/report-query-params";
import {
  buildComparePayloadFromReportQuery,
  createCompareReportData,
} from "@/features/reports/lib/compare-report-builder";
import type { CompareReportData } from "@/features/reports/types";

export async function getCompareReport(
  params: URLSearchParams,
): Promise<CompareReportData> {
  const parsed = parseCompareReportSearchParams(params);
  if (!parsed.ok) {
    throw new BffUpstreamError({
      code: BFF_ERROR_CODES.BAD_REQUEST,
      message: parsed.message,
      status: 400,
      upstreamPath: "/bff/reports/compare",
    });
  }

  Sentry.addBreadcrumb({
    category: "bff",
    message: "compare report bootstrap start",
    level: "info",
    data: {
      baseCtprvnCd: parsed.value.base.ctprvnCd,
      baseSignguCd: parsed.value.base.signguCd,
      targetCtprvnCd: parsed.value.target.ctprvnCd,
      targetSignguCd: parsed.value.target.signguCd,
      indsLclsCd: parsed.value.category?.indsLclsCd,
    },
  });

  const bootstrap = await getExploreBootstrap();
  const comparePayload = buildComparePayloadFromReportQuery(
    parsed.value,
    bootstrap.regions,
    bootstrap.categories,
  );

  const rankingParams = toSearchParams({
    ctprvnCd: comparePayload.base.ctprvnCd ?? "11",
    signguCd: comparePayload.base.signguCd,
    groupBy: "SIGUNGU",
    indsLclsCd: comparePayload.category?.indsLclsCd,
    indsMclsCd: comparePayload.category?.indsMclsCd,
    indsSclsCd: comparePayload.category?.indsSclsCd,
    limit: 5,
  });

  const [result, regionRanking] = await Promise.all([
    springApiFetch<CompareRegionsResult>("/api/analysis/compare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comparePayload),
    }),
    springApiFetch<RegionRankingItem[]>(
      buildUrl("/api/analysis/region-ranking", rankingParams),
    ).catch(() => []),
  ]);

  return createCompareReportData({
    query: parsed.value,
    comparePayload,
    result,
    regionRanking,
  });
}
