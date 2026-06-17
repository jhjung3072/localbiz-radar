"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { StatusPlaceholder } from "@/components/common/status-placeholder";
import { compareRegions, getRegionRanking } from "@/features/compare/api/compare-api";
import { compareQueryKeys } from "@/features/compare/api/compare-query-keys";
import { getMasterCategories, getMasterRegions } from "@/features/master/api/master-api";
import { masterQueryKeys } from "@/features/master/api/master-query-keys";
import { parseCompareReportSearchParams } from "@/features/reports/api/report-query-params";
import { CompareReportView } from "@/features/reports/components/compare-report-view";
import {
  buildComparePayloadFromReportQuery,
  createCompareReportData,
} from "@/features/reports/lib/compare-report-builder";

export function CompareReportClientLoader() {
  const searchParams = useSearchParams();
  const parsed = useMemo(
    () => parseCompareReportSearchParams(searchParams),
    [searchParams],
  );

  const regionsQuery = useQuery({
    queryKey: masterQueryKeys.regions(),
    queryFn: getMasterRegions,
    enabled: parsed.ok,
  });
  const categoriesQuery = useQuery({
    queryKey: masterQueryKeys.categories(),
    queryFn: getMasterCategories,
    enabled: parsed.ok,
  });

  const comparePayload = useMemo(() => {
    if (!parsed.ok || !regionsQuery.data || !categoriesQuery.data) {
      return null;
    }
    return buildComparePayloadFromReportQuery(
      parsed.value,
      regionsQuery.data,
      categoriesQuery.data,
    );
  }, [categoriesQuery.data, parsed, regionsQuery.data]);

  const compareQuery = useQuery({
    queryKey: compareQueryKeys.result(comparePayload ?? { base: {}, target: {} }),
    queryFn: () => compareRegions(comparePayload!),
    enabled: Boolean(comparePayload),
  });

  const rankingParams = useMemo(
    () => ({
      ctprvnCd: comparePayload?.base.ctprvnCd ?? "11",
      signguCd: comparePayload?.base.signguCd,
      groupBy: "SIGUNGU" as const,
      indsLclsCd: comparePayload?.category?.indsLclsCd,
      indsMclsCd: comparePayload?.category?.indsMclsCd,
      indsSclsCd: comparePayload?.category?.indsSclsCd,
      limit: 5,
    }),
    [comparePayload],
  );
  const rankingQuery = useQuery({
    queryKey: compareQueryKeys.ranking(rankingParams),
    queryFn: () => getRegionRanking(rankingParams),
    enabled: Boolean(comparePayload),
  });

  if (!parsed.ok) {
    return (
      <StatusPlaceholder
        type="error"
        title="리포트 조건이 올바르지 않습니다"
        description={parsed.message}
      />
    );
  }

  const isLoading =
    regionsQuery.isLoading ||
    categoriesQuery.isLoading ||
    compareQuery.isLoading ||
    rankingQuery.isLoading;
  const isError =
    regionsQuery.isError ||
    categoriesQuery.isError ||
    compareQuery.isError;

  if (isLoading) {
    return <ReportSkeleton />;
  }

  if (isError || !comparePayload || !compareQuery.data) {
    return (
      <StatusPlaceholder
        type="error"
        title="리포트를 불러오지 못했습니다"
        description="API 서버 상태와 공유 링크의 지역/업종 조건을 확인해 주세요."
      />
    );
  }

  return (
    <CompareReportView
      report={createCompareReportData({
        query: parsed.value,
        comparePayload,
        result: compareQuery.data,
        regionRanking: rankingQuery.data ?? [],
      })}
    />
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-5" aria-label="리포트 로딩 중">
      <div className="h-28 animate-pulse rounded-[8px] bg-slate-100" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[8px] bg-slate-100" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-[8px] bg-slate-100" />
    </div>
  );
}
