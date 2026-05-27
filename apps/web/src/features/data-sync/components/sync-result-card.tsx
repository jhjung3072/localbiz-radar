"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreSyncResult } from "@/features/data-sync/types";
import { statusLabel, statusToneClassName } from "@/features/data-sync/components/sync-status";

type SyncResultCardProps = {
  result: StoreSyncResult | null;
};

const targetLinks = [
  { href: "/stores", label: "점포 목록 확인" },
  { href: "/dashboard", label: "대시보드 확인" },
  { href: "/analysis", label: "상권 분석 확인" },
  { href: "/map", label: "지도 marker 확인" },
];

export function SyncResultCard({ result }: SyncResultCardProps) {
  if (!result) {
    return (
      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">동기화 결과</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          CSV 업로드 또는 OpenAPI 동기화를 실행하면 성공 row, 실패 row와 실패
          요약이 표시됩니다.
        </p>
      </section>
    );
  }

  const hasErrors = result.errors.length > 0;

  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">동기화 결과</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{result.message}</p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold ${statusToneClassName(
            result.status,
          )}`}
        >
          {hasErrors ? (
            <AlertCircle className="size-4" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          )}
          {statusLabel(result.status)}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-4">
        {"fetchedRows" in result ? (
          <>
            <Metric label="조회 row" value={result.fetchedRows} />
            <Metric label="insert row" value={result.insertedRows} />
            <Metric label="update row" value={result.updatedRows} />
            <Metric label="요청 page" value={result.requestedPages} />
          </>
        ) : (
          <Metric label="총 row" value={result.totalRows} />
        )}
        <Metric label="성공 row" value={result.successRows} />
        <Metric label="실패 row" value={result.failedRows} />
        <Metric label="건너뜀 row" value={result.skippedRows} />
      </dl>

      {hasErrors ? (
        <div className="mt-5 rounded-md border border-rose-100 bg-rose-50 p-3">
          <h3 className="text-sm font-semibold text-rose-800">실패 row 요약</h3>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-rose-800">
            {result.errors.map((error) => (
              <li key={`${"pageNo" in error ? error.pageNo : 0}-${error.rowNumber}-${error.message}`}>
                {"pageNo" in error ? `page ${error.pageNo} ` : null}
                row {error.rowNumber}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!result.dryRun && result.status !== "FAILED" ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {targetLinks.map((link) => (
            <Button key={link.href} asChild variant="outline" size="sm">
              <Link href={link.href}>
                {link.label}
                <ExternalLink className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-slate-950">
        {value.toLocaleString("ko-KR")}
      </dd>
    </div>
  );
}
