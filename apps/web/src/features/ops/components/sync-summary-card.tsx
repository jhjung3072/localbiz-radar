"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OpsSyncSummary } from "@/features/ops/types";
import {
  formatDateTime,
  formatNumber,
  syncStatusLabel,
  syncTypeLabel,
} from "@/features/ops/components/ops-format";

type SyncSummaryCardProps = {
  syncSummary: OpsSyncSummary;
};

export function SyncSummaryCard({ syncSummary }: SyncSummaryCardProps) {
  const successRate =
    syncSummary.totalRuns === 0
      ? 0
      : Math.round((syncSummary.successRuns / syncSummary.totalRuns) * 1000) / 10;

  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">최근 동기화 상태</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            최근 {syncSummary.days}일 동안의 동기화 성공, 부분 성공, 실패 현황입니다.
          </p>
        </div>
        <div className="rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 ring-1 ring-teal-100">
          성공률 {successRate.toFixed(1)}%
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div
          className="h-72"
          role="img"
          aria-label={`최근 ${syncSummary.days}일 동기화 총 ${syncSummary.totalRuns}회, 성공 ${syncSummary.successRuns}회, 부분 성공 ${syncSummary.partialSuccessRuns}회, 실패 ${syncSummary.failedRuns}회`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={syncSummary.byType} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="syncType"
                tickFormatter={syncTypeLabel}
                tickLine={false}
                axisLine={false}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(label) => syncTypeLabel(String(label))}
                formatter={(value, name) => [
                  formatNumber(Number(value)),
                  name === "successRuns"
                    ? "성공"
                    : name === "partialSuccessRuns"
                      ? "부분 성공"
                      : "실패",
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === "successRuns"
                    ? "성공"
                    : value === "partialSuccessRuns"
                      ? "부분 성공"
                      : "실패"
                }
              />
              <Bar dataKey="successRuns" stackId="sync" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="partialSuccessRuns" stackId="sync" fill="#d97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failedRuns" stackId="sync" fill="#be123c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-950">최근 실패 이력</h3>
          {syncSummary.recentFailures.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              최근 기간에 실패한 동기화가 없습니다.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {syncSummary.recentFailures.map((failure) => (
                <li
                  key={failure.syncLogId}
                  className="rounded-md bg-white p-3 text-sm ring-1 ring-slate-200"
                >
                  <p className="font-semibold text-slate-950">
                    {syncTypeLabel(failure.syncType)} · {syncStatusLabel(failure.status)}
                  </p>
                  <p className="mt-1 text-slate-600">{failure.message ?? "실패 메시지가 없습니다."}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDateTime(failure.finishedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
