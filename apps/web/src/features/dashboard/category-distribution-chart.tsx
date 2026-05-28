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

type CategoryDistributionChartProps = {
  data: Array<{
    category: string;
    stores: number;
  }>;
};

export function CategoryDistributionChart({
  data,
}: CategoryDistributionChartProps) {
  const isClient = useIsClient();

  return (
    <div className="h-80 w-full" aria-label="업종별 점포 수 막대 차트">
      <p className="sr-only">
        업종별 점포 수를 막대 차트로 표시합니다. 같은 데이터는 인기 업종 랭킹
        목록에서도 확인할 수 있습니다.
      </p>
      {isClient ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#475569", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              width={44}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
              formatter={(value) => [
                `${Number(value).toLocaleString("ko-KR")}개`,
                "점포 수",
              ]}
            />
            <Bar dataKey="stores" fill="#0f766e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-md bg-slate-50" />
      )}
    </div>
  );
}
