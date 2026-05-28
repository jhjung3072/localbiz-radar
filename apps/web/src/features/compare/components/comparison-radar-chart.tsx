"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useIsClient } from "@/lib/use-is-client";
import type { MetricComparison } from "@/features/compare/types";

export function ComparisonRadarChart({ data }: { data: MetricComparison[] }) {
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
      <h2 className="text-lg font-semibold text-slate-950">균형 비교</h2>
      <div className="mt-4 h-80 w-full" aria-label="A/B 지표 비교 레이더 차트">
        {isClient ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#475569", fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}점`, ""]} />
              <Radar name="기준 지역" dataKey="base" stroke="#0f766e" fill="#0f766e" fillOpacity={0.18} />
              <Radar name="비교 지역" dataKey="target" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.16} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-md bg-slate-50" />
        )}
      </div>
    </article>
  );
}
