import { describe, expect, it } from "vitest";
import { buildCompareReportUrl, buildCompareUrlFromReportQuery } from "@/features/reports/lib/report-url";

const query = {
  base: {
    ctprvnCd: "11",
    ctprvnNm: "서울특별시",
    signguCd: "11680",
    signguNm: "강남구",
  },
  target: {
    ctprvnCd: "11",
    ctprvnNm: "서울특별시",
    signguCd: "11440",
    signguNm: "마포구",
  },
  category: {
    indsLclsCd: "I2",
    indsLclsNm: "음식점",
  },
};

describe("report-url", () => {
  it("builds a shareable report URL with canonical params", () => {
    const url = buildCompareReportUrl(query);

    expect(url).toContain("/reports/compare?");
    expect(url).toContain("baseCtprvnCd=11");
    expect(url).toContain("targetSignguCd=11440");
    expect(url).toContain("indsLclsCd=I2");
  });

  it("builds a compare URL from report query", () => {
    const url = buildCompareUrlFromReportQuery(query);

    expect(url).toContain("/compare?");
    expect(url).toContain("baseCtprvnCd=11");
    expect(url).toContain("targetSignguCd=11440");
  });
});
