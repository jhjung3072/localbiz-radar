"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ListOrdered, MapPinned, Store, Tags, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { StatusPlaceholder } from "@/components/common/status-placeholder";
import {
  getAnalysisSummary,
  getCategoryDistribution,
} from "@/features/analysis/api/analysis-api";
import { analysisQueryKeys } from "@/features/analysis/api/analysis-query-keys";
import type { CategoryDistributionItem } from "@/features/analysis/types";
import type { DashboardBffData } from "@/features/bff/server/types";
import { formatCompactNumber } from "@/lib/format";

const CategoryDistributionChart = dynamic(
  () =>
    import("@/features/dashboard/category-distribution-chart").then(
      (mod) => mod.CategoryDistributionChart,
    ),
  {
    ssr: false,
    loading: () => <ChartFallback />,
  },
);

const dashboardRegion = {
  sido: "서울특별시",
};

type DashboardBootstrapViewProps = {
  initialData?: DashboardBffData | null;
};

export function DashboardBootstrapView({
  initialData,
}: DashboardBootstrapViewProps) {
  const summaryQuery = useQuery({
    queryKey: analysisQueryKeys.summary(dashboardRegion),
    queryFn: () => getAnalysisSummary(dashboardRegion),
    initialData: initialData?.summary,
  });
  const distributionQuery = useQuery({
    queryKey: analysisQueryKeys.categoryDistribution({
      ...dashboardRegion,
      depth: "small",
    }),
    queryFn: () =>
      getCategoryDistribution({
        ...dashboardRegion,
        depth: "small",
      }),
    initialData: initialData?.categoryDistribution,
  });

  const chartData = useMemo(
    () =>
      (distributionQuery.data ?? []).map((item) => ({
        category: item.categoryName,
        stores: item.storeCount,
      })),
    [distributionQuery.data],
  );
  const popularCategories = useMemo(
    () => (distributionQuery.data ?? []).slice(0, 5),
    [distributionQuery.data],
  );
  const isLoading = summaryQuery.isLoading || distributionQuery.isLoading;
  const isError = summaryQuery.isError || distributionQuery.isError;
  const isEmpty = !isLoading && !isError && (summaryQuery.data?.totalStores ?? 0) === 0;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">실데이터 대시보드</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
              지역 상권 대시보드
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              현재 지표는 개발용 점포 seed data를 기반으로 계산합니다. 실제
              유동인구와 추정매출 기반 분석은 이후 공공 데이터 연동 단계에서
              추가됩니다.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            seed data 기반 임시 지표
          </div>
        </div>
      </section>

      {isLoading ? <DashboardSkeleton /> : null}

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
          description="현재 조회 조건에 해당하는 seed data가 없습니다."
        />
      ) : null}

      {!isLoading && !isError && !isEmpty && summaryQuery.data ? (
        <>
          <section
            aria-label="상권 요약 지표"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard
              title="총 점포 수"
              value={formatCompactNumber(summaryQuery.data.totalStores)}
              description="선택 지역의 seed data 기준 점포 수"
              icon={<Store className="size-5" />}
              accent="teal"
            />
            <MetricCard
              title="활성 업종 수"
              value={`${summaryQuery.data.totalCategories.toLocaleString("ko-KR")}개`}
              description="소분류 기준 distinct 업종 수"
              icon={<Tags className="size-5" />}
              accent="indigo"
            />
            <MetricCard
              title="선택 지역"
              value={summaryQuery.data.selectedRegionLabel}
              description="현재 대시보드 기본 조회 조건"
              icon={<MapPinned className="size-5" />}
              accent="amber"
            />
            <MetricCard
              title="경쟁 지수"
              value={summaryQuery.data.competitionIndex.toFixed(1)}
              description="상위 업종 집중도를 0-100으로 환산"
              icon={<TrendingUp className="size-5" />}
              accent="rose"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    업종별 점포 분포
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    서울특별시 seed data의 소분류 업종별 점포 수
                  </p>
                </div>
                <BarChart3Icon />
              </div>
              {chartData.length > 0 ? (
                <CategoryDistributionChart data={chartData} />
              ) : (
                <EmptyChart />
              )}
            </article>

            <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <ListOrdered className="size-5 text-teal-700" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">
                  인기 업종 순위
                </h2>
              </div>
              <ol className="space-y-3">
                {popularCategories.map((category, index) => (
                  <PopularCategoryItem
                    key={category.categoryCode}
                    category={category}
                    rank={index + 1}
                  />
                ))}
              </ol>
            </article>
          </section>

          <section
            aria-labelledby="score-note-title"
            className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />
              <h2 id="score-note-title" className="text-xl font-semibold text-slate-950">
                지표 해석 안내
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              경쟁 지수, 업종 다양성, LocalBiz 점수는 현재 seed data의 점포 수와
              업종 분포만으로 계산한 개발용 지표입니다.
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}

function PopularCategoryItem({
  category,
  rank,
}: {
  category: CategoryDistributionItem;
  rank: number;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-7 items-center justify-center rounded-md bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
          {rank}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {category.categoryName}
          </p>
          <p className="text-xs text-slate-500">
            {category.storeCount.toLocaleString("ko-KR")}개 점포
          </p>
        </div>
      </div>
      <span className="text-sm font-medium text-teal-700">
        {category.ratio.toFixed(1)}%
      </span>
    </li>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="대시보드 로딩 중">
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
      <div className="h-80 animate-pulse rounded-[8px] border border-slate-200 bg-white" />
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-80 items-center justify-center rounded-md bg-slate-50 text-sm text-slate-500">
      분석할 점포 데이터가 없습니다.
    </div>
  );
}

function ChartFallback() {
  return <div className="h-80 w-full animate-pulse rounded-md bg-slate-50" />;
}

function BarChart3Icon() {
  return (
    <div className="flex size-10 items-center justify-center rounded-md bg-teal-50 text-teal-700 ring-1 ring-teal-100">
      <TrendingUp className="size-5" aria-hidden="true" />
    </div>
  );
}
