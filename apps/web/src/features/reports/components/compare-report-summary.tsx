import { MapPinned, Target, Trophy } from "lucide-react";
import type { CompareReportData } from "@/features/reports/types";

export function CompareReportSummary({ report }: { report: CompareReportData }) {
  return (
    <section aria-labelledby="report-summary-title" className="grid gap-4 lg:grid-cols-4">
      <h2 id="report-summary-title" className="sr-only">
        리포트 요약
      </h2>
      <SummaryItem
        icon={<MapPinned className="size-5" />}
        label="기준 지역"
        value={report.base.regionLabel}
      />
      <SummaryItem
        icon={<MapPinned className="size-5" />}
        label="비교 지역"
        value={report.target.regionLabel}
      />
      <SummaryItem
        icon={<Target className="size-5" />}
        label="관심 업종"
        value={report.categoryLabel}
      />
      <SummaryItem
        icon={<Trophy className="size-5" />}
        label="추천 지역"
        value={report.winner.regionLabel}
      />
    </section>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <span className="text-teal-700" aria-hidden="true">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-3 text-lg font-semibold text-slate-950">{value}</p>
    </article>
  );
}
