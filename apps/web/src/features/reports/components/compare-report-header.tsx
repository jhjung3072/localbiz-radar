import type { CompareReportData } from "@/features/reports/types";

export function CompareReportHeader({ report }: { report: CompareReportData }) {
  return (
    <header className="border-b border-slate-200 pb-6">
      <p className="text-sm font-semibold text-teal-700">LocalBiz Radar</p>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            {report.reportTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {report.reportDescription}
          </p>
        </div>
        <dl className="rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div>
            <dt className="font-semibold text-slate-500">생성 시각</dt>
            <dd className="mt-1 text-slate-950">
              {formatDateTime(report.generatedAt)}
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
