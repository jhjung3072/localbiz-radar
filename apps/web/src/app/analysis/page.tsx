"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, BadgePercent, GitCompare, Layers3, MapPinned, Trophy } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { StatusPlaceholder } from "@/components/common/status-placeholder";
import {
  compareAnalysis,
  getAnalysisSummary,
  getCategoryDistribution,
  getCompetition,
} from "@/features/analysis/api/analysis-api";
import { analysisQueryKeys } from "@/features/analysis/api/analysis-query-keys";
import type {
  AnalysisFilterParams,
  CompareAnalysisPayload,
  CompareAreaResult,
} from "@/features/analysis/types";
import { CategoryMixChart } from "@/features/analysis/category-mix-chart";
import { getRegions, getStoreCategories } from "@/features/stores/api/store-api";
import { storeQueryKeys } from "@/features/stores/api/store-query-keys";
import { addSafeBreadcrumb } from "@/lib/sentry-utils";

const selectClassName =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400";

export default function AnalysisPage() {
  const [baseSido, setBaseSido] = useState("11");
  const [baseSigungu, setBaseSigungu] = useState("11440");
  const [baseDong, setBaseDong] = useState("all");
  const [targetSido, setTargetSido] = useState("11");
  const [targetSigungu, setTargetSigungu] = useState("11200");
  const [targetDong, setTargetDong] = useState("all");
  const [categoryLargeCode, setCategoryLargeCode] = useState("all");
  const [categoryMediumCode, setCategoryMediumCode] = useState("all");
  const [categorySmallCode, setCategorySmallCode] = useState("all");

  const regionsQuery = useQuery({
    queryKey: storeQueryKeys.regions(),
    queryFn: getRegions,
  });
  const categoriesQuery = useQuery({
    queryKey: storeQueryKeys.categories(),
    queryFn: getStoreCategories,
  });

  const selectedBaseSido = regionsQuery.data?.find(
    (region) => region.sidoCode === baseSido,
  );
  const selectedTargetSido = regionsQuery.data?.find(
    (region) => region.sidoCode === targetSido,
  );
  const baseSigunguOptions = selectedBaseSido?.sigunguList ?? [];
  const targetSigunguOptions = selectedTargetSido?.sigunguList ?? [];
  const selectedBaseSigungu = baseSigunguOptions.find(
    (region) => region.sigunguCode === baseSigungu,
  );
  const selectedTargetSigungu = targetSigunguOptions.find(
    (region) => region.sigunguCode === targetSigungu,
  );
  const baseDongOptions = selectedBaseSigungu?.dongList ?? [];
  const targetDongOptions = selectedTargetSigungu?.dongList ?? [];
  const selectedBaseDong = baseDongOptions.find(
    (region) => region.dongCode === baseDong,
  );
  const selectedTargetDong = targetDongOptions.find(
    (region) => region.dongCode === targetDong,
  );

  const analysisParams = useMemo<AnalysisFilterParams>(
    () => ({
      sido: normalizeSelectValue(selectedBaseSido?.sidoName ?? "all"),
      sigungu: normalizeSelectValue(selectedBaseSigungu?.sigunguName ?? "all"),
      dong: normalizeSelectValue(selectedBaseDong?.dongName ?? "all"),
      categoryLargeCode: normalizeSelectValue(categoryLargeCode),
      categoryMediumCode: normalizeSelectValue(categoryMediumCode),
      categorySmallCode: normalizeSelectValue(categorySmallCode),
    }),
    [
      categoryLargeCode,
      categoryMediumCode,
      categorySmallCode,
      selectedBaseDong,
      selectedBaseSido,
      selectedBaseSigungu,
    ],
  );
  const comparePayload = useMemo<CompareAnalysisPayload>(
    () => ({
      base: {
        sido: selectedBaseSido?.sidoName ?? "",
        sigungu: selectedBaseSigungu?.sigunguName ?? "",
        dong: normalizeSelectValue(selectedBaseDong?.dongName ?? "all"),
        categoryLargeCode: normalizeSelectValue(categoryLargeCode),
        categoryMediumCode: normalizeSelectValue(categoryMediumCode),
        categorySmallCode: normalizeSelectValue(categorySmallCode),
      },
      target: {
        sido: selectedTargetSido?.sidoName ?? "",
        sigungu: selectedTargetSigungu?.sigunguName ?? "",
        dong: normalizeSelectValue(selectedTargetDong?.dongName ?? "all"),
        categoryLargeCode: normalizeSelectValue(categoryLargeCode),
        categoryMediumCode: normalizeSelectValue(categoryMediumCode),
        categorySmallCode: normalizeSelectValue(categorySmallCode),
      },
    }),
    [
      categoryLargeCode,
      categoryMediumCode,
      categorySmallCode,
      selectedBaseDong,
      selectedBaseSido,
      selectedBaseSigungu,
      selectedTargetDong,
      selectedTargetSido,
      selectedTargetSigungu,
    ],
  );

  const summaryQuery = useQuery({
    queryKey: analysisQueryKeys.summary(analysisParams),
    queryFn: () => getAnalysisSummary(analysisParams),
  });
  const distributionQuery = useQuery({
    queryKey: analysisQueryKeys.categoryDistribution({
      sido: analysisParams.sido,
      sigungu: analysisParams.sigungu,
      dong: analysisParams.dong,
      depth: "small",
    }),
    queryFn: () =>
      getCategoryDistribution({
        sido: analysisParams.sido,
        sigungu: analysisParams.sigungu,
        dong: analysisParams.dong,
        depth: "small",
      }),
  });
  const competitionQuery = useQuery({
    queryKey: analysisQueryKeys.competition({
      ...analysisParams,
      radius: 500,
    }),
    queryFn: () =>
      getCompetition({
        ...analysisParams,
        radius: 500,
      }),
  });
  const compareQuery = useQuery({
    queryKey: analysisQueryKeys.compare(comparePayload),
    queryFn: () => compareAnalysis(comparePayload),
    enabled:
      comparePayload.base.sido.length > 0 &&
      comparePayload.base.sigungu.length > 0 &&
      comparePayload.target.sido.length > 0 &&
      comparePayload.target.sigungu.length > 0,
  });

  const chartData = useMemo(
    () =>
      (distributionQuery.data ?? []).map((item) => ({
        name: item.categoryName,
        value: item.ratio,
      })),
    [distributionQuery.data],
  );
  const selectedLargeCategory = categoriesQuery.data?.find(
    (category) => category.largeCode === categoryLargeCode,
  );
  const mediumCategoryOptions = selectedLargeCategory?.mediumCategories ?? [];
  const selectedMediumCategory = mediumCategoryOptions.find(
    (category) => category.mediumCode === categoryMediumCode,
  );
  const smallCategoryOptions = selectedMediumCategory?.smallCategories ?? [];
  const isLoading =
    summaryQuery.isLoading ||
    distributionQuery.isLoading ||
    competitionQuery.isLoading ||
    regionsQuery.isLoading ||
    categoriesQuery.isLoading;
  const isError =
    summaryQuery.isError ||
    distributionQuery.isError ||
    competitionQuery.isError ||
    regionsQuery.isError ||
    categoriesQuery.isError;
  const isEmpty = !isLoading && !isError && (summaryQuery.data?.totalStores ?? 0) === 0;

  useEffect(() => {
    addSafeBreadcrumb("analysis.filter", "상권 분석 조건 변경", {
      hasRegion: baseSido !== "all" || baseSigungu !== "all" || baseDong !== "all",
      hasCategory:
        categoryLargeCode !== "all" ||
        categoryMediumCode !== "all" ||
        categorySmallCode !== "all",
    });
  }, [
    baseDong,
    baseSido,
    baseSigungu,
    categoryLargeCode,
    categoryMediumCode,
    categorySmallCode,
  ]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">상권 분석</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            상권 분석
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            지역과 업종을 선택해 seed data 기반 경쟁 수준과 카테고리 구성을
            살펴봅니다. 실제 유동인구/추정매출 기반 분석은 이후 공공 데이터
            연동 단계에서 추가됩니다.
          </p>
        </div>
      </section>

      <section
        aria-label="분석 조건"
        className="grid gap-4 rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-3"
      >
        <RegionFilter
          title="분석 지역"
          prefix="base"
          sido={baseSido}
          sigungu={baseSigungu}
          dong={baseDong}
          sidoOptions={regionsQuery.data ?? []}
          sigunguOptions={baseSigunguOptions}
          dongOptions={baseDongOptions}
          onSidoChange={(value) => {
            setBaseSido(value);
            setBaseSigungu("all");
            setBaseDong("all");
          }}
          onSigunguChange={(value) => {
            setBaseSigungu(value);
            setBaseDong("all");
          }}
          onDongChange={setBaseDong}
        />

        <CategoryFilter
          largeCode={categoryLargeCode}
          mediumCode={categoryMediumCode}
          smallCode={categorySmallCode}
          largeOptions={categoriesQuery.data ?? []}
          mediumOptions={mediumCategoryOptions}
          smallOptions={smallCategoryOptions}
          onLargeChange={(value) => {
            setCategoryLargeCode(value);
            setCategoryMediumCode("all");
            setCategorySmallCode("all");
          }}
          onMediumChange={(value) => {
            setCategoryMediumCode(value);
            setCategorySmallCode("all");
          }}
          onSmallChange={setCategorySmallCode}
        />

        <div className="rounded-md bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
          현재 점수는 개발용 점포 데이터 기반의 임시 지표입니다. 외부 공공 API
          또는 지도 기반 공간 분석은 사용하지 않습니다.
        </div>
      </section>

      {isLoading ? <AnalysisSkeleton /> : null}

      {isError ? (
        <StatusPlaceholder
          type="error"
          title="데이터를 불러오지 못했습니다"
          description="API 서버와 PostgreSQL 실행 상태를 확인한 뒤 다시 시도해 주세요."
        />
      ) : null}

      {isEmpty ? (
        <StatusPlaceholder
          type="empty"
          title="분석할 점포 데이터가 없습니다"
          description="선택한 지역 또는 업종 조건에 해당하는 seed data가 없습니다."
        />
      ) : null}

      {!isLoading && !isError && !isEmpty && summaryQuery.data && competitionQuery.data ? (
        <>
          <section
            aria-label="분석 지표"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard
              title="경쟁 점포 수"
              value={`${competitionQuery.data.sameCategoryStoreCount.toLocaleString("ko-KR")}개`}
              description={summaryQuery.data.selectedCategoryLabel}
              icon={<Activity className="size-5" />}
              accent="teal"
            />
            <MetricCard
              title="점포 밀도"
              value={`${competitionQuery.data.totalStoresInArea.toLocaleString("ko-KR")}개`}
              description="선택 영역 내 전체 점포 수"
              icon={<MapPinned className="size-5" />}
              accent="indigo"
            />
            <MetricCard
              title="업종 다양성"
              value={summaryQuery.data.categoryDiversityScore.toFixed(1)}
              description="소분류 distinct 비율 기반 0-100 점수"
              icon={<Layers3 className="size-5" />}
              accent="amber"
            />
            <MetricCard
              title="LocalBiz 점수"
              value={summaryQuery.data.localBizScore.toFixed(1)}
              description="점포량, 다양성, 경쟁도를 조합한 임시 점수"
              icon={<Trophy className="size-5" />}
              accent="rose"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <BadgePercent className="size-5 text-indigo-700" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">
                  업종 구성
                </h2>
              </div>
              {chartData.length > 0 ? (
                <CategoryMixChart data={chartData} />
              ) : (
                <EmptyPanel message="분석할 업종 분포 데이터가 없습니다." />
              )}
            </article>

            <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <GitCompare className="size-5 text-teal-700" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">
                  후보 지역 비교
                </h2>
              </div>
              <RegionFilter
                title="비교 지역"
                prefix="target"
                sido={targetSido}
                sigungu={targetSigungu}
                dong={targetDong}
                sidoOptions={regionsQuery.data ?? []}
                sigunguOptions={targetSigunguOptions}
                dongOptions={targetDongOptions}
                onSidoChange={(value) => {
                  setTargetSido(value);
                  setTargetSigungu("all");
                  setTargetDong("all");
                }}
                onSigunguChange={(value) => {
                  setTargetSigungu(value);
                  setTargetDong("all");
                }}
                onDongChange={setTargetDong}
              />

              <div className="mt-5">
                {compareQuery.isLoading ? (
                  <EmptyPanel message="비교 데이터를 계산하는 중입니다." />
                ) : compareQuery.isError ? (
                  <EmptyPanel message="비교 데이터를 불러오지 못했습니다." />
                ) : compareQuery.data ? (
                  <ComparePreview data={compareQuery.data} />
                ) : (
                  <EmptyPanel message="비교할 시군구를 선택해 주세요." />
                )}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}

function RegionFilter({
  title,
  prefix,
  sido,
  sigungu,
  dong,
  sidoOptions,
  sigunguOptions,
  dongOptions,
  onSidoChange,
  onSigunguChange,
  onDongChange,
}: {
  title: string;
  prefix: string;
  sido: string;
  sigungu: string;
  dong: string;
  sidoOptions: Array<{
    sidoCode: string;
    sidoName: string;
  }>;
  sigunguOptions: Array<{
    sigunguCode: string;
    sigunguName: string;
  }>;
  dongOptions: Array<{
    dongCode: string;
    dongName: string;
  }>;
  onSidoChange: (value: string) => void;
  onSigunguChange: (value: string) => void;
  onDongChange: (value: string) => void;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-sm font-semibold text-slate-950">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-medium text-slate-700">
          시도
          <select
            id={`${prefix}-sido`}
            value={sido}
            onChange={(event) => onSidoChange(event.target.value)}
            className={`${selectClassName} mt-2`}
          >
            <option value="all">전체 시도</option>
            {sidoOptions.map((option) => (
              <option key={option.sidoCode} value={option.sidoCode}>
                {option.sidoName}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          시군구
          <select
            id={`${prefix}-sigungu`}
            value={sigungu}
            onChange={(event) => onSigunguChange(event.target.value)}
            className={`${selectClassName} mt-2`}
            disabled={sido === "all"}
          >
            <option value="all">전체 시군구</option>
            {sigunguOptions.map((option) => (
              <option key={option.sigunguCode} value={option.sigunguCode}>
                {option.sigunguName}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          행정동
          <select
            id={`${prefix}-dong`}
            value={dong}
            onChange={(event) => onDongChange(event.target.value)}
            className={`${selectClassName} mt-2`}
            disabled={sigungu === "all"}
          >
            <option value="all">전체 동</option>
            {dongOptions.map((option) => (
              <option key={option.dongCode} value={option.dongCode}>
                {option.dongName}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

function CategoryFilter({
  largeCode,
  mediumCode,
  smallCode,
  largeOptions,
  mediumOptions,
  smallOptions,
  onLargeChange,
  onMediumChange,
  onSmallChange,
}: {
  largeCode: string;
  mediumCode: string;
  smallCode: string;
  largeOptions: Array<{
    largeCode: string;
    largeName: string;
  }>;
  mediumOptions: Array<{
    mediumCode: string;
    mediumName: string;
  }>;
  smallOptions: Array<{
    smallCode: string;
    smallName: string;
  }>;
  onLargeChange: (value: string) => void;
  onMediumChange: (value: string) => void;
  onSmallChange: (value: string) => void;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-sm font-semibold text-slate-950">업종 선택</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-medium text-slate-700">
          대분류
          <select
            value={largeCode}
            onChange={(event) => onLargeChange(event.target.value)}
            className={`${selectClassName} mt-2`}
          >
            <option value="all">전체 업종</option>
            {largeOptions.map((option) => (
              <option key={option.largeCode} value={option.largeCode}>
                {option.largeName}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          중분류
          <select
            value={mediumCode}
            onChange={(event) => onMediumChange(event.target.value)}
            className={`${selectClassName} mt-2`}
            disabled={largeCode === "all"}
          >
            <option value="all">전체 중분류</option>
            {mediumOptions.map((option) => (
              <option key={option.mediumCode} value={option.mediumCode}>
                {option.mediumName}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          소분류
          <select
            value={smallCode}
            onChange={(event) => onSmallChange(event.target.value)}
            className={`${selectClassName} mt-2`}
            disabled={mediumCode === "all"}
          >
            <option value="all">전체 소분류</option>
            {smallOptions.map((option) => (
              <option key={option.smallCode} value={option.smallCode}>
                {option.smallName}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

function ComparePreview({ data }: { data: { base: CompareAreaResult; target: CompareAreaResult; winner: { regionLabel: string; reason: string } } }) {
  return (
    <div className="grid gap-4">
      {[data.base, data.target].map((area) => (
        <div
          key={area.regionLabel}
          className="rounded-md border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-950">{area.regionLabel}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                대표 업종: {area.topCategoryName}
              </p>
            </div>
            <span className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-slate-200">
              {area.localBizScore.toFixed(1)}
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">점포 수</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {area.totalStores.toLocaleString("ko-KR")}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">업종 수</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {area.totalCategories.toLocaleString("ko-KR")}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">경쟁 지수</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {area.competitionIndex.toFixed(1)}
              </dd>
            </div>
          </dl>
        </div>
      ))}
      <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
        <p className="font-semibold">비교 결과: {data.winner.regionLabel}</p>
        <p className="mt-2 leading-6">{data.winner.reason}</p>
      </div>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6" aria-label="상권 분석 로딩 중">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="mt-4 h-8 w-32 rounded bg-slate-100" />
            <div className="mt-6 h-4 w-full rounded bg-slate-100" />
          </div>
        ))}
      </section>
      <div className="h-72 animate-pulse rounded-[8px] border border-slate-200 bg-white" />
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-md bg-slate-50 px-4 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function normalizeSelectValue(value: string) {
  return value === "all" ? undefined : value;
}
