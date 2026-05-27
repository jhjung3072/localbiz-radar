"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CsvUploadCard } from "@/features/data-sync/components/csv-upload-card";
import { OpenApiSyncCard } from "@/features/data-sync/components/openapi-sync-card";
import { SyncGuideCard } from "@/features/data-sync/components/sync-guide-card";
import { SyncLogTable } from "@/features/data-sync/components/sync-log-table";
import { SyncResultCard } from "@/features/data-sync/components/sync-result-card";
import {
  dryRunStoresFromOpenApi,
  getOpenApiSyncStatus,
  getSyncLogs,
  importStoreCsv,
  syncStoresFromOpenApi,
  updateOpenApiSchedule,
} from "@/features/data-sync/api/sync-api";
import { syncQueryKeys } from "@/features/data-sync/api/sync-query-keys";
import type { StoreSyncResult } from "@/features/data-sync/types";

export default function DataSyncPage() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<StoreSyncResult | null>(null);
  const [page, setPage] = useState(0);
  const size = 10;

  const logsParams = { page, size };
  const logsQuery = useQuery({
    queryKey: syncQueryKeys.logs(logsParams),
    queryFn: () => getSyncLogs(logsParams),
  });
  const openApiStatusQuery = useQuery({
    queryKey: syncQueryKeys.openApiStatus(),
    queryFn: getOpenApiSyncStatus,
  });
  const importMutation = useMutation({
    mutationFn: importStoreCsv,
    onSuccess: async (response) => {
      setResult(response);
      setPage(0);
      await queryClient.invalidateQueries({ queryKey: syncQueryKeys.all });
    },
  });
  const openApiDryRunMutation = useMutation({
    mutationFn: dryRunStoresFromOpenApi,
    onSuccess: async (response) => {
      setResult(response);
      setPage(0);
      await queryClient.invalidateQueries({ queryKey: syncQueryKeys.all });
    },
  });
  const openApiSyncMutation = useMutation({
    mutationFn: syncStoresFromOpenApi,
    onSuccess: async (response) => {
      setResult(response);
      setPage(0);
      await queryClient.invalidateQueries({ queryKey: syncQueryKeys.all });
    },
  });
  const scheduleMutation = useMutation({
    mutationFn: updateOpenApiSchedule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: syncQueryKeys.openApiStatus(),
      });
    },
  });

  const openApiError =
    openApiDryRunMutation.error ??
    openApiSyncMutation.error ??
    scheduleMutation.error;
  const isOpenApiRunning =
    openApiDryRunMutation.isPending || openApiSyncMutation.isPending;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">개발용 데이터 도구</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            데이터 동기화
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            소상공인 상가정보 CSV를 업로드해 개발 DB의 점포 데이터를 검증하거나
            공공데이터 OpenAPI를 backend에서 호출해 제한된 범위의 점포 데이터를
            동기화합니다. service key는 frontend에 저장하거나 노출하지 않습니다.
          </p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <CsvUploadCard
          isUploading={importMutation.isPending}
          onSubmit={(file, dryRun) => importMutation.mutate({ file, dryRun })}
        />
        <SyncGuideCard />
      </div>

      <OpenApiSyncCard
        status={openApiStatusQuery.data}
        isStatusLoading={openApiStatusQuery.isLoading}
        isRunning={isOpenApiRunning}
        isUpdatingSchedule={scheduleMutation.isPending}
        onDryRun={(payload) => openApiDryRunMutation.mutate(payload)}
        onSync={(payload) => openApiSyncMutation.mutate(payload)}
        onRefreshStatus={() => openApiStatusQuery.refetch()}
        onToggleSchedule={(enabled) => scheduleMutation.mutate(enabled)}
      />

      {importMutation.isError ? (
        <div
          role="alert"
          className="rounded-[8px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <p className="font-semibold">CSV 업로드에 실패했습니다.</p>
          <p className="mt-2 leading-6">
            {importMutation.error instanceof Error
              ? importMutation.error.message
              : "API 서버 상태와 파일 형식을 확인해 주세요."}
          </p>
        </div>
      ) : null}

      {openApiStatusQuery.isError || openApiError ? (
        <div
          role="alert"
          className="rounded-[8px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <p className="font-semibold">OpenAPI 동기화 요청에 실패했습니다.</p>
          <p className="mt-2 leading-6">
            {openApiError instanceof Error
              ? openApiError.message
              : "OpenAPI 설정 상태와 API 서버 로그를 확인해 주세요."}
          </p>
        </div>
      ) : null}

      <SyncResultCard result={result} />

      <SyncLogTable
        data={logsQuery.data}
        isLoading={logsQuery.isLoading}
        isError={logsQuery.isError}
        page={page}
        onPageChange={setPage}
        onRetry={() => logsQuery.refetch()}
      />
    </div>
  );
}
