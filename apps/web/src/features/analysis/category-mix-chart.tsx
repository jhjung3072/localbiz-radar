"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsClient } from "@/lib/use-is-client";

type CategoryMixChartProps = {
  data: Array<{
    name: string;
    value: number;
  }>;
};

export function CategoryMixChart({ data }: CategoryMixChartProps) {
  const isClient = useIsClient();

  return (
    <div className="h-72 w-full" aria-label="카테고리 구성 비율 차트">
      <p className="sr-only">
        선택한 지역의 업종 구성 비율을 막대 차트로 표시합니다.
      </p>
      {isClient ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 18, right: 20, top: 12, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#e2e8f0"
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              unit="%"
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#475569", fontSize: 12 }}
              width={72}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
              formatter={(value) => [`${Number(value)}%`, "구성 비율"]}
            />
            <Bar dataKey="value" fill="#4f46e5" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-md bg-slate-50" />
      )}
    </div>
  );
}
