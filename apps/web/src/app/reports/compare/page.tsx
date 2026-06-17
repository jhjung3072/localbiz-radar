import type { Metadata } from "next";
import { Suspense } from "react";
import * as Sentry from "@sentry/nextjs";
import { BFF_ERROR_CODES, BffUpstreamError } from "@/features/bff/server/bff-error";
import { CompareReportClientLoader } from "@/features/reports/components/compare-report-client-loader";
import { CompareReportView } from "@/features/reports/components/compare-report-view";
import { searchParamsFromRecord } from "@/features/reports/api/report-query-params";
import { buildCompareReportMetadata } from "@/features/reports/lib/report-metadata";
import { getCompareReport } from "@/features/reports/server/get-compare-report";

type CompareReportPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: CompareReportPageProps): Promise<Metadata> {
  try {
    const params = searchParamsFromRecord(await searchParams);
    const report = await getCompareReport(params);
    return buildCompareReportMetadata(report);
  } catch {
    return buildCompareReportMetadata(null);
  }
}

export default async function CompareReportPage({
  searchParams,
}: CompareReportPageProps) {
  const params = searchParamsFromRecord(await searchParams);
  let report = null;

  try {
    report = await getCompareReport(params);
    Sentry.addBreadcrumb({
      category: "report",
      message: "compare report server render succeeded",
      level: "info",
      data: {
        baseCtprvnCd: report.comparePayload.base.ctprvnCd,
        targetCtprvnCd: report.comparePayload.target.ctprvnCd,
        indsLclsCd: report.comparePayload.category?.indsLclsCd,
      },
    });
  } catch (error) {
    if (error instanceof BffUpstreamError && error.code === BFF_ERROR_CODES.BAD_REQUEST) {
      return (
        <div className="mx-auto max-w-4xl rounded-[8px] border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <h1 className="text-2xl font-semibold">리포트 조건이 올바르지 않습니다</h1>
          <p className="mt-3 text-sm leading-6">
            기준 지역과 비교 지역의 시도/시군구 코드가 포함된 공유 링크가
            필요합니다.
          </p>
        </div>
      );
    }

    Sentry.captureException(error, {
      tags: {
        category: "report",
        failureType: "compare_report_server_render",
      },
    });

    return (
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-[8px] border border-slate-200 bg-slate-100" />
        }
      >
        <CompareReportClientLoader />
      </Suspense>
    );
  }

  return <CompareReportView report={report} />;
}
