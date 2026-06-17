import type { CompareAreaResult, MetricComparison } from "@/features/compare/types";

const metricLabels: Record<string, string> = {
  localBizScore: "LocalBiz 점수",
  totalStores: "총 점포 수",
  categoryStoreCount: "관심 업종 점포 수",
  competitionIndex: "경쟁 강도",
  categoryDiversityScore: "업종 다양성",
  densityScore: "점포 밀도",
};

export function CompareReportMetrics({
  base,
  target,
  metricComparisons,
}: {
  base: CompareAreaResult;
  target: CompareAreaResult;
  metricComparisons: MetricComparison[];
}) {
  const defaultRows = [
    {
      key: "localBizScore",
      label: metricLabels.localBizScore,
      baseValue: base.localBizScore,
      targetValue: target.localBizScore,
    },
    {
      key: "totalStores",
      label: metricLabels.totalStores,
      baseValue: base.totalStores,
      targetValue: target.totalStores,
    },
    {
      key: "categoryStoreCount",
      label: metricLabels.categoryStoreCount,
      baseValue: base.categoryStoreCount,
      targetValue: target.categoryStoreCount,
    },
  ];
  const defaultKeys = new Set(defaultRows.map((row) => row.key));
  const rows = [
    ...defaultRows,
    ...metricComparisons
      .filter((item) => !defaultKeys.has(item.metricKey))
      .map((item) => ({
        key: item.metricKey,
        label: item.metricName,
        baseValue: item.baseValue,
        targetValue: item.targetValue,
      })),
  ];

  return (
    <section
      aria-labelledby="report-metrics-title"
      className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 id="report-metrics-title" className="text-xl font-semibold text-slate-950">
          핵심 지표 비교
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          차트 없이도 인쇄물에서 비교할 수 있도록 주요 수치를 표로 제공합니다.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only">
            기준 지역과 비교 지역의 LocalBiz 지표 비교표
          </caption>
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">지표</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">
                {base.regionLabel}
              </th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">
                {target.regionLabel}
              </th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">우세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="px-4 py-3 font-semibold text-slate-700">{row.label}</td>
                <td className="px-4 py-3 text-slate-950">
                  {formatMetric(row.key, row.baseValue)}
                </td>
                <td className="px-4 py-3 text-slate-950">
                  {formatMetric(row.key, row.targetValue)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {winnerLabel(row.baseValue, row.targetValue, base.regionLabel, target.regionLabel)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function winnerLabel(
  baseValue: number,
  targetValue: number,
  baseLabel: string,
  targetLabel: string,
) {
  if (baseValue === targetValue) {
    return "동률";
  }
  return baseValue > targetValue ? baseLabel : targetLabel;
}

function formatMetric(key: string, value: number) {
  if (key === "totalStores" || key === "categoryStoreCount") {
    return `${new Intl.NumberFormat("ko-KR").format(value)}개`;
  }
  return value.toFixed(1);
}
