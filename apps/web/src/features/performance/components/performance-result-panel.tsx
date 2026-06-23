"use client";

import type { LargeListMetric } from "@/features/performance/types";

type PerformanceResultPanelProps = {
  metric: LargeListMetric | null;
};

export function PerformanceResultPanel({ metric }: PerformanceResultPanelProps) {
  const items = [
    ["총 점포", metric?.totalStoreCount],
    ["렌더 row", metric?.renderedRowCount],
    ["전체 DOM", metric?.totalDomNodeCount],
    ["목록 DOM", metric?.listDomNodeCount],
    ["초기 렌더", formatMs(metric?.initialRenderMs)],
    ["스크롤", formatMs(metric?.scrollTestDurationMs)],
    ["상세 열기", formatMs(metric?.clickToDetailOpenMs)],
  ];

  return (
    <aside
      className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm"
      aria-label="성능 측정 결과"
    >
      <h2 className="text-base font-semibold text-slate-950">현재 측정값</h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-[8px] bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 truncate font-mono text-sm text-slate-950">
              {value ?? "측정 중"}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function formatMs(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  return `${value.toFixed(1)}ms`;
}
