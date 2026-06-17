import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompareReportActions } from "@/features/reports/components/compare-report-actions";
import { CompareReportHeader } from "@/features/reports/components/compare-report-header";
import { CompareReportMetrics } from "@/features/reports/components/compare-report-metrics";
import { CompareReportRanking } from "@/features/reports/components/compare-report-ranking";
import { CompareReportSummary } from "@/features/reports/components/compare-report-summary";
import { PrintNotice } from "@/features/reports/components/print-notice";
import type { CompareReportData } from "@/features/reports/types";

export function CompareReportView({ report }: { report: CompareReportData }) {
  return (
    <article className="compare-report mx-auto max-w-6xl space-y-6">
      <CompareReportActions report={report} />
      <CompareReportHeader report={report} />
      <CompareReportSummary report={report} />

      <section className="rounded-[8px] border border-teal-200 bg-teal-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-teal-700 ring-1 ring-teal-100">
            <Trophy className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-teal-800">추천 지역</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              {report.winner.regionLabel}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {report.winner.reason}
            </p>
          </div>
        </div>
      </section>

      <CompareReportMetrics
        base={report.base}
        target={report.target}
        metricComparisons={report.metricComparisons}
      />
      <CompareReportRanking data={report.regionRanking} />
      <PrintNotice />

      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">데이터 출처와 한계</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {report.sourceNotice}
        </p>
        <div className="report-actions mt-5">
          <Button asChild variant="outline">
            <Link href="/stores">
              탐색 화면으로 이동
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
