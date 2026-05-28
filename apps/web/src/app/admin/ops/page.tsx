"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { AdminGuard } from "@/features/auth/components/admin-guard";
import {
  getOpsDataQuality,
  getOpsOverview,
  getOpsSyncSummary,
} from "@/features/ops/api/ops-api";
import { opsQueryKeys } from "@/features/ops/api/ops-query-keys";
import { DataQualityCard } from "@/features/ops/components/data-quality-card";
import { ObservabilityGuideCard } from "@/features/ops/components/observability-guide-card";
import { OpsHealthStatus } from "@/features/ops/components/ops-health-status";
import { OpsOverviewCards } from "@/features/ops/components/ops-overview-cards";
import { SyncSummaryCard } from "@/features/ops/components/sync-summary-card";

export default function AdminOpsPage() {
  return (
    <Suspense fallback={<LoadingState title="운영 상태를 확인하는 중입니다" />}>
      <AdminGuard>
        <AdminOpsContent />
      </AdminGuard>
    </Suspense>
  );
}

function AdminOpsContent() {
  const overviewQuery = useQuery({
    queryKey: opsQueryKeys.overview(),
    queryFn: getOpsOverview,
  });
  const syncSummaryQuery = useQuery({
    queryKey: opsQueryKeys.syncSummary(7),
    queryFn: () => getOpsSyncSummary(7),
  });
  const dataQualityQuery = useQuery({
    queryKey: opsQueryKeys.dataQuality(),
    queryFn: getOpsDataQuality,
  });

  const isLoading =
    overviewQuery.isLoading ||
    syncSummaryQuery.isLoading ||
    dataQualityQuery.isLoading;
  const isError =
    overviewQuery.isError ||
    syncSummaryQuery.isError ||
    dataQualityQuery.isError;

  if (isLoading) {
    return (
      <LoadingState
        title="운영 상태를 불러오는 중입니다"
        description="서비스 상태, 데이터 품질, 동기화 지표를 조회하고 있습니다."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="운영 상태를 불러오지 못했습니다"
        description="관리자 인증 상태와 API 서버 상태를 확인한 뒤 다시 시도해 주세요."
        onRetry={() => {
          void overviewQuery.refetch();
          void syncSummaryQuery.refetch();
          void dataQualityQuery.refetch();
        }}
      />
    );
  }

  if (!overviewQuery.data || !syncSummaryQuery.data || !dataQualityQuery.data) {
    return (
      <EmptyState
        title="운영 대시보드 데이터가 없습니다"
        description="API 서버와 데이터베이스 상태를 확인해 주세요."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="관리자 운영"
        title="운영 대시보드"
        description="서비스 상태, 데이터 품질, 최근 동기화 이력과 관측성 도구 접속 정보를 확인합니다."
      />

      <OpsHealthStatus service={overviewQuery.data.service} />
      <OpsOverviewCards overview={overviewQuery.data} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <SyncSummaryCard syncSummary={syncSummaryQuery.data} />
        <ObservabilityGuideCard />
      </div>

      <DataQualityCard dataQuality={dataQualityQuery.data} />
    </div>
  );
}
