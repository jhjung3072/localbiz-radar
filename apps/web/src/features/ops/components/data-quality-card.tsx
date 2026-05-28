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
import type { OpsDataQuality } from "@/features/ops/types";
import {
  formatNumber,
  formatRate,
} from "@/features/ops/components/ops-format";

type DataQualityCardProps = {
  dataQuality: OpsDataQuality;
};

export function DataQualityCard({ dataQuality }: DataQualityCardProps) {
  const chartData = [
    { name: "좌표", rate: dataQuality.coordinateCoverageRate },
    { name: "주소", rate: dataQuality.addressCoverageRate },
    { name: "업종", rate: dataQuality.categoryCoverageRate },
  ];

  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">데이터 품질</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          점포 데이터의 좌표, 주소, 업종 필드 보유율을 확인합니다.
        </p>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div
          className="h-64"
          role="img"
          aria-label={`좌표 보유율 ${formatRate(dataQuality.coordinateCoverageRate)}, 주소 보유율 ${formatRate(dataQuality.addressCoverageRate)}, 업종 보유율 ${formatRate(dataQuality.categoryCoverageRate)}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "보유율"]} />
              <Bar dataKey="rate" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <dl className="grid gap-3">
          <QualityMetric
            label="좌표 누락"
            value={`${formatNumber(dataQuality.missingCoordinateCount)}개`}
          />
          <QualityMetric
            label="도로명 주소 누락"
            value={`${formatNumber(dataQuality.missingRoadAddressCount)}개`}
          />
          <QualityMetric
            label="지번 주소 누락"
            value={`${formatNumber(dataQuality.missingLotAddressCount)}개`}
          />
          <QualityMetric
            label="중복 외부 점포 ID"
            value={`${formatNumber(dataQuality.duplicateExternalStoreCount)}개`}
          />
        </dl>
      </div>
    </section>
  );
}

function QualityMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
