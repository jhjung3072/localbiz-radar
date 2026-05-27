"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CsvUploadCard } from "@/features/data-sync/components/csv-upload-card";
import { SyncGuideCard } from "@/features/data-sync/components/sync-guide-card";
import { SyncLogTable } from "@/features/data-sync/components/sync-log-table";
import { SyncResultCard } from "@/features/data-sync/components/sync-result-card";
import {
  getSyncLogs,
  importStoreCsv,
} from "@/features/data-sync/api/sync-api";
import { syncQueryKeys } from "@/features/data-sync/api/sync-query-keys";
import type { StoreCsvImportResult } from "@/features/data-sync/types";

export default function DataSyncPage() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<StoreCsvImportResult | null>(null);
  const [page, setPage] = useState(0);
  const size = 10;

  const logsParams = { page, size };
  const logsQuery = useQuery({
    queryKey: syncQueryKeys.logs(logsParams),
    queryFn: () => getSyncLogs(logsParams),
  });
  const importMutation = useMutation({
    mutationFn: importStoreCsv,
    onSuccess: async (response) => {
      setResult(response);
      setPage(0);
      await queryClient.invalidateQueries({ queryKey: syncQueryKeys.all });
    },
  });

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
            반영합니다. 이번 단계에서는 실시간 OpenAPI 호출과 스케줄러 자동
            동기화는 사용하지 않습니다.
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
