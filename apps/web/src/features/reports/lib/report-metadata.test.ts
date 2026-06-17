import { describe, expect, it } from "vitest";
import { buildCompareReportMetadata } from "@/features/reports/lib/report-metadata";
import type { CompareReportData } from "@/features/reports/types";

describe("report metadata", () => {
  it("returns generic metadata when report is not available", () => {
    const metadata = buildCompareReportMetadata(null);

    expect(metadata.title).toBe("상권 비교 리포트 | LocalBiz Radar");
  });

  it("uses report title and description", () => {
    const metadata = buildCompareReportMetadata({
      reportTitle: "강남구 vs 마포구 음식점 상권 비교 리포트",
      reportDescription: "음식점 업종 기준 비교 리포트입니다.",
    } as CompareReportData);

    expect(metadata.title).toBe(
      "강남구 vs 마포구 음식점 상권 비교 리포트 | LocalBiz Radar",
    );
    expect(metadata.description).toBe("음식점 업종 기준 비교 리포트입니다.");
  });
});
