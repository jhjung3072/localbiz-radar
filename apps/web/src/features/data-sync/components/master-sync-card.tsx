"use client";

import { DatabaseZap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  MasterDataStatus,
  MasterSyncResult,
} from "@/features/master/types";

type MasterSyncCardProps = {
  status?: MasterDataStatus;
  result: MasterSyncResult | null;
  isStatusLoading: boolean;
  isRegionRunning: boolean;
  isCategoryRunning: boolean;
  onRegionDryRun: () => void;
  onRegionSync: () => void;
  onCategoryDryRun: () => void;
  onCategorySync: () => void;
  onRefreshStatus: () => void;
};

export function MasterSyncCard({
  status,
  result,
  isStatusLoading,
  isRegionRunning,
  isCategoryRunning,
  onRegionDryRun,
  onRegionSync,
  onCategoryDryRun,
  onCategorySync,
  onRefreshStatus,
}: MasterSyncCardProps) {
  const resultErrors = result?.errors ?? [];

  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
            <DatabaseZap className="size-5 text-teal-700" aria-hidden="true" />
            마스터 데이터 동기화
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            공공데이터 활용가이드 기준 행정구역 코드와 업종 코드 체계를
            backend에서 동기화합니다. 먼저 dry-run으로 호출 결과를 확인하세요.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefreshStatus}
          disabled={isStatusLoading}
        >
          상태 새로고침
        </Button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <StatusMetric label="시도" value={status?.sidoCount} loading={isStatusLoading} />
        <StatusMetric label="시군구" value={status?.sigunguCount} loading={isStatusLoading} />
        <StatusMetric label="행정동" value={status?.adminDongCount} loading={isStatusLoading} />
        <StatusMetric label="대분류" value={status?.largeCategoryCount} loading={isStatusLoading} />
        <StatusMetric label="중분류" value={status?.mediumCategoryCount} loading={isStatusLoading} />
        <StatusMetric label="소분류" value={status?.smallCategoryCount} loading={isStatusLoading} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ActionPanel
          title="행정구역 코드 마스터"
          description="baroApi의 mega, cty, admi 오퍼레이션을 서울특별시 기준으로 제한 호출합니다."
          isRunning={isRegionRunning}
          onDryRun={onRegionDryRun}
          onSync={onRegionSync}
        />
        <ActionPanel
          title="업종 코드 마스터"
          description="largeUpjongList, middleUpjongList, smallUpjongList를 제한 범위로 호출합니다."
          isRunning={isCategoryRunning}
          onDryRun={onCategoryDryRun}
          onSync={onCategorySync}
        />
      </div>

      {result ? (
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-slate-950">{result.message}</p>
            <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {result.status}
            </span>
          </div>
          <div className="mt-3 grid gap-2 text-slate-600 sm:grid-cols-5">
            <ResultMetric label="요청" value={result.requestedCount} />
            <ResultMetric label="조회 row" value={result.fetchedRows} />
            <ResultMetric label="insert" value={result.insertedRows} />
            <ResultMetric label="update" value={result.updatedRows} />
            <ResultMetric label="실패" value={result.failedRows} />
          </div>
          {resultErrors.length > 0 ? (
            <ul className="mt-3 space-y-1 text-rose-700">
              {resultErrors.map((error, index) => (
                <li key={`${error.scope}-${index}`}>
                  {error.scope}: {error.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function StatusMetric({
  label,
  value,
  loading,
}: {
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">
        {loading ? "-" : (value ?? 0).toLocaleString("ko-KR")}
      </p>
    </div>
  );
}

function ActionPanel({
  title,
  description,
  isRunning,
  onDryRun,
  onSync,
}: {
  title: string;
  description: string;
  isRunning: boolean;
  onDryRun: () => void;
  onSync: () => void;
}) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onDryRun} disabled={isRunning}>
          {isRunning ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          dry-run
        </Button>
        <Button type="button" onClick={onSync} disabled={isRunning}>
          실제 반영
        </Button>
      </div>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">
        {value.toLocaleString("ko-KR")}
      </p>
    </div>
  );
}
