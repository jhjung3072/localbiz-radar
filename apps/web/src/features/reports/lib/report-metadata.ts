import type { Metadata } from "next";
import type { CompareReportData } from "@/features/reports/types";

const DEFAULT_TITLE = "상권 비교 리포트 | LocalBiz Radar";
const DEFAULT_DESCRIPTION =
  "지역과 업종 조건을 기준으로 점포 수, 경쟁 강도, 업종 다양성, LocalBiz 점수를 비교합니다.";

export function buildCompareReportMetadata(
  report?: CompareReportData | null,
): Metadata {
  const title = report?.reportTitle
    ? `${report.reportTitle} | LocalBiz Radar`
    : DEFAULT_TITLE;
  const description = report?.reportDescription ?? DEFAULT_DESCRIPTION;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "LocalBiz Radar",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
