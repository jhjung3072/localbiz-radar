"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compareRegions, getRegionRanking } from "@/features/compare/api/compare-api";
import { compareQueryKeys } from "@/features/compare/api/compare-query-keys";
import { CompareConditionForm } from "@/features/compare/components/compare-condition-form";
import { CompareEmptyState } from "@/features/compare/components/compare-empty-state";
import { CompareErrorState } from "@/features/compare/components/compare-error-state";
import { ComparisonChart } from "@/features/compare/components/comparison-chart";
import { ComparisonRadarChart } from "@/features/compare/components/comparison-radar-chart";
import { ComparisonSummaryCards } from "@/features/compare/components/comparison-summary-cards";
import { RecentComparisons } from "@/features/compare/components/recent-comparisons";
import { RegionRankingTable } from "@/features/compare/components/region-ranking-table";
import { TopCategoryComparison } from "@/features/compare/components/top-category-comparison";
import { WinnerInsightCard } from "@/features/compare/components/winner-insight-card";
import {
  DEFAULT_COMPARE_SELECTION,
  selectionFromSearchParams,
  selectionToSearchParams,
} from "@/features/compare/lib/compare-url-state";
import {
  readRecentComparisons,
  saveRecentComparison,
  type RecentComparison,
} from "@/features/compare/lib/recent-comparison-storage";
import { CandidateTray } from "@/features/explore/components/candidate-tray";
import { useCandidateTray } from "@/features/explore/hooks/use-candidate-tray";
import { createCandidateRegion } from "@/features/explore/lib/candidate-storage";
import type { CompareBootstrapData } from "@/features/bff/server/types";
import type {
  CompareRegionsPayload,
  CompareSelection,
  RegionRankingItem,
  RegionRankingParams,
} from "@/features/compare/types";
import { getMasterCategories, getMasterRegions } from "@/features/master/api/master-api";
import { masterQueryKeys } from "@/features/master/api/master-query-keys";
import type { MasterCategory, MasterRegion } from "@/features/master/types";
import {
  buildCompareReportUrl,
  buildReportQueryFromSelection,
} from "@/features/reports/lib/report-url";
import { addSafeBreadcrumb } from "@/lib/sentry-utils";

type ComparePageClientProps = {
  initialData?: CompareBootstrapData | null;
};

export function ComparePageClient({ initialData }: ComparePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSelection = useMemo(
    () => selectionFromSearchParams(searchParams),
    [searchParams],
  );
  const [selection, setSelection] = useState<CompareSelection>(initialSelection);
  const [submittedSelection, setSubmittedSelection] =
    useState<CompareSelection>(initialSelection);
  const [recentComparisons, setRecentComparisons] = useState<RecentComparison[]>([]);
  const candidateTray = useCandidateTray();

  const regionsQuery = useQuery({
    queryKey: masterQueryKeys.regions(),
    queryFn: getMasterRegions,
    initialData: initialData?.regions,
  });
  const categoriesQuery = useQuery({
    queryKey: masterQueryKeys.categories(),
    queryFn: getMasterCategories,
    initialData: initialData?.categories,
  });

  const comparePayload = useMemo(
    () =>
      buildComparePayload(
        submittedSelection,
        regionsQuery.data ?? [],
        categoriesQuery.data ?? [],
      ),
    [categoriesQuery.data, regionsQuery.data, submittedSelection],
  );
  const rankingParams = useMemo<RegionRankingParams>(
    () => ({
      ctprvnCd:
        submittedSelection.baseSido === "all" ? "11" : submittedSelection.baseSido,
      groupBy: "SIGUNGU",
      indsLclsCd: normalizeSelectValue(submittedSelection.large),
      indsMclsCd: normalizeSelectValue(submittedSelection.medium),
      indsSclsCd: normalizeSelectValue(submittedSelection.small),
      limit: 10,
    }),
    [submittedSelection],
  );
  const reportUrl = useMemo(() => {
    const reportQuery = buildReportQueryFromSelection(
      submittedSelection,
      regionsQuery.data ?? [],
      categoriesQuery.data ?? [],
    );
    return reportQuery ? buildCompareReportUrl(reportQuery) : null;
  }, [categoriesQuery.data, regionsQuery.data, submittedSelection]);

  const isMasterLoading = regionsQuery.isLoading || categoriesQuery.isLoading;
  const hasMasterData =
    (regionsQuery.data?.length ?? 0) > 0 && (categoriesQuery.data?.length ?? 0) > 0;
  const canCompare = Boolean(comparePayload);
  const compareQuery = useQuery({
    queryKey: compareQueryKeys.result(comparePayload ?? emptyComparePayload()),
    queryFn: () => compareRegions(comparePayload as CompareRegionsPayload),
    enabled: canCompare,
  });
  const rankingQuery = useQuery({
    queryKey: compareQueryKeys.ranking(rankingParams),
    queryFn: () => getRegionRanking(rankingParams),
    enabled: hasMasterData,
    initialData:
      initialData &&
      JSON.stringify(rankingParams) === JSON.stringify(initialData.rankingParams)
        ? initialData.regionRanking
        : undefined,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelection(initialSelection);
      setSubmittedSelection(initialSelection);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialSelection]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecentComparisons(readRecentComparisons());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!compareQuery.data) {
      return;
    }
    const timer = window.setTimeout(() => {
      setRecentComparisons(
        saveRecentComparison(
          submittedSelection,
          `${compareQuery.data.base.regionLabel} ↔ ${compareQuery.data.target.regionLabel}`,
        ),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [compareQuery.data, submittedSelection]);

  function handleSubmit() {
    addSafeBreadcrumb("compare.submit", "후보 지역 비교 실행", {
      hasCategory: selection.large !== "all",
      hasAdminDong:
        selection.baseDong !== "all" || selection.targetDong !== "all",
    });
    setSubmittedSelection(selection);
    router.replace(`${pathname}?${selectionToSearchParams(selection).toString()}`, {
      scroll: false,
    });
  }

  function handleSwap() {
    setSelection((current) => ({
      ...current,
      baseSido: current.targetSido,
      baseSigungu: current.targetSigungu,
      baseDong: current.targetDong,
      targetSido: current.baseSido,
      targetSigungu: current.baseSigungu,
      targetDong: current.baseDong,
    }));
  }

  function handleReset() {
    setSelection(DEFAULT_COMPARE_SELECTION);
    setSubmittedSelection(DEFAULT_COMPARE_SELECTION);
    router.replace(pathname, { scroll: false });
  }

  function handleSelectRankingTarget(item: RegionRankingItem) {
    setSelection((current) => ({
      ...current,
      targetSido: item.ctprvnCd ?? current.targetSido,
      targetSigungu: item.signguCd ?? "all",
      targetDong: item.adongCd ?? "all",
    }));
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">후보 지역 비교</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            후보 지역 비교
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            지역과 업종을 선택해 점포 밀도, 경쟁 강도, 업종 다양성을 비교합니다.
            현재 점수는 점포 데이터 기반의 개발용 지표입니다.
          </p>
        </div>
      </section>

      <CompareConditionForm
        selection={selection}
        regions={regionsQuery.data ?? []}
        categories={categoriesQuery.data ?? []}
        isLoading={isMasterLoading}
        isComparing={compareQuery.isFetching}
        onChange={setSelection}
        onSubmit={handleSubmit}
        onSwap={handleSwap}
        onReset={handleReset}
      />

      <CandidateTray
        candidates={candidateTray.candidates}
        isReady={candidateTray.isReady}
        onRemove={candidateTray.removeCandidate}
        onClear={candidateTray.clearCandidates}
      />

      {!isMasterLoading && !hasMasterData ? (
        <CompareEmptyState
          title="마스터 데이터가 필요합니다"
          description="/data-sync에서 행정구역과 업종 코드 마스터를 먼저 동기화해 주세요."
        />
      ) : null}

      {compareQuery.isLoading || isMasterLoading ? <CompareSkeleton /> : null}

      {compareQuery.isError ? (
        <CompareErrorState
          message="API 서버 상태와 비교 조건을 확인한 뒤 다시 시도해 주세요."
          onRetry={() => compareQuery.refetch()}
        />
      ) : null}

      {compareQuery.data ? (
        <>
          <WinnerInsightCard result={compareQuery.data} />
          {reportUrl ? (
            <section className="flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  공유 가능한 리포트
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  현재 비교 조건을 URL만으로 다시 열 수 있는 리포트 페이지로
                  확인합니다.
                </p>
              </div>
              <Button asChild>
                <Link
                  href={reportUrl}
                  onClick={() =>
                    addSafeBreadcrumb("compare.report", "리포트로 보기 클릭", {
                      hasCategory: submittedSelection.large !== "all",
                      hasAdminDong:
                        submittedSelection.baseDong !== "all" ||
                        submittedSelection.targetDong !== "all",
                    })
                  }
                >
                  <FileText className="size-4" aria-hidden="true" />
                  리포트로 보기
                </Link>
              </Button>
            </section>
          ) : null}
          <ComparisonSummaryCards
            base={compareQuery.data.base}
            target={compareQuery.data.target}
          />
          <div className="grid gap-5 xl:grid-cols-2">
            <ComparisonChart data={compareQuery.data.metricComparisons} />
            <ComparisonRadarChart data={compareQuery.data.metricComparisons} />
          </div>
          <TopCategoryComparison
            base={compareQuery.data.base}
            target={compareQuery.data.target}
          />
        </>
      ) : null}

      {!compareQuery.isLoading &&
      !compareQuery.isError &&
      compareQuery.data &&
      compareQuery.data.base.totalStores === 0 &&
      compareQuery.data.target.totalStores === 0 ? (
        <CompareEmptyState
          title="선택한 조건에 맞는 데이터가 없습니다"
          description="다른 지역이나 업종 조건으로 다시 비교해 주세요."
        />
      ) : null}

      <RegionRankingTable
        data={rankingQuery.data}
        isLoading={rankingQuery.isLoading}
        isError={rankingQuery.isError}
        onSelectTarget={handleSelectRankingTarget}
        onAddCandidate={(item) => {
          const candidate = createCandidateRegion({
            ctprvnCd: item.ctprvnCd ?? undefined,
            ctprvnNm: item.ctprvnNm ?? undefined,
            signguCd: item.signguCd ?? undefined,
            signguNm: item.signguNm ?? undefined,
            adongCd: item.adongCd ?? undefined,
            adongNm: item.adongNm ?? undefined,
            source: "RANKING",
          });
          if (candidate) {
            candidateTray.addCandidate(candidate);
          }
        }}
      />

      <RecentComparisons
        items={recentComparisons}
        onSelect={(item) => {
          setSelection(item);
          setSubmittedSelection(item);
          router.replace(`${pathname}?${selectionToSearchParams(item).toString()}`, {
            scroll: false,
          });
        }}
      />
    </div>
  );
}

function buildComparePayload(
  selection: CompareSelection,
  regions: MasterRegion[],
  categories: MasterCategory[],
): CompareRegionsPayload | null {
  const base = resolveRegion(selection.baseSido, selection.baseSigungu, selection.baseDong, regions);
  const target = resolveRegion(
    selection.targetSido,
    selection.targetSigungu,
    selection.targetDong,
    regions,
  );
  if (!base || !target) {
    return null;
  }

  const category = resolveCategory(selection, categories);
  return category ? { base, target, category } : { base, target };
}

function resolveRegion(
  sidoCode: string,
  sigunguCode: string,
  dongCode: string,
  regions: MasterRegion[],
) {
  const sido = regions.find((region) => region.ctprvnCd === sidoCode);
  const sigungu = sido?.sigunguList.find((item) => item.signguCd === sigunguCode);
  const dong = sigungu?.adminDongList.find((item) => item.code === dongCode);
  if (!sido || !sigungu) {
    return null;
  }

  return {
    ctprvnCd: sido.ctprvnCd,
    ctprvnNm: sido.ctprvnNm,
    signguCd: sigungu.signguCd,
    signguNm: sigungu.signguNm,
    adongCd: dong?.code,
    adongNm: dong?.name,
  };
}

function resolveCategory(selection: CompareSelection, categories: MasterCategory[]) {
  const large = categories.find((category) => category.indsLclsCd === selection.large);
  const medium = large?.mediumCategories.find(
    (category) => category.indsMclsCd === selection.medium,
  );
  const small = medium?.smallCategories.find(
    (category) => category.indsSclsCd === selection.small,
  );

  if (!large) {
    return undefined;
  }

  return {
    indsLclsCd: large.indsLclsCd,
    indsLclsNm: large.indsLclsNm,
    indsMclsCd: medium?.indsMclsCd,
    indsMclsNm: medium?.indsMclsNm,
    indsSclsCd: small?.indsSclsCd,
    indsSclsNm: small?.indsSclsNm,
  };
}

function normalizeSelectValue(value: string) {
  return value === "all" ? undefined : value;
}

function emptyComparePayload(): CompareRegionsPayload {
  return {
    base: {},
    target: {},
  };
}

function CompareSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-[8px] border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}
