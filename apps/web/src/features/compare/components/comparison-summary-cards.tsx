import { Activity, Layers3, MapPinned, Store, Target, Trophy } from "lucide-react";
import type { CompareAreaResult } from "@/features/compare/types";

export function ComparisonSummaryCards({
  base,
  target,
}: {
  base: CompareAreaResult;
  target: CompareAreaResult;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <AreaCard label="A 기준 지역" area={base} />
      <AreaCard label="B 비교 지역" area={target} />
    </section>
  );
}

function AreaCard({ label, area }: { label: string; area: CompareAreaResult }) {
  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-teal-700">{label}</p>
      <h3 className="mt-1 text-xl font-semibold text-slate-950">
        {area.regionLabel}
      </h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric icon={<Trophy className="size-4" />} label="LocalBiz 점수" value={formatScore(area.localBizScore)} />
        <Metric icon={<Store className="size-4" />} label="총 점포 수" value={`${formatNumber(area.totalStores)}개`} />
        <Metric icon={<Target className="size-4" />} label="선택 업종 점포" value={`${formatNumber(area.categoryStoreCount)}개`} />
        <Metric icon={<Activity className="size-4" />} label="경쟁 강도" value={formatScore(area.competitionIndex)} />
        <Metric icon={<Layers3 className="size-4" />} label="업종 다양성" value={formatScore(area.categoryDiversityScore)} />
        <Metric icon={<MapPinned className="size-4" />} label="점포 밀도" value={formatScore(area.densityScore)} />
      </div>
    </article>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function formatScore(value: number) {
  return value.toFixed(1);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}
