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
import { useIsClient } from "@/lib/use-is-client";
import type { MetricComparison } from "@/features/compare/types";

export function ComparisonChart({
  data,
}: {
  data: MetricComparison[];
}) {
  const isClient = useIsClient();
  const chartData = data
    .filter((item) =>
      ["localBizScore", "competitionIndex", "categoryDiversityScore", "densityScore"].includes(
        item.metricKey,
      ),
    )
    .map((item) => ({
      metric: item.metricName,
      base: item.baseValue,
      target: item.targetValue,
    }));

  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">지표 비교</h2>
      <div className="mt-4 h-80 w-full" aria-label="A/B 지표 비교 막대 차트">
        {isClient ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="metric" tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}점`, ""]} />
              <Legend />
              <Bar dataKey="base" name="기준 지역" fill="#0f766e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="target" name="비교 지역" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-md bg-slate-50" />
        )}
      </div>
    </article>
  );
}
