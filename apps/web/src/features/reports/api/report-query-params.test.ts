import { describe, expect, it } from "vitest";
import {
  parseCompareReportSearchParams,
  reportQueryToSearchParams,
} from "@/features/reports/api/report-query-params";

describe("report query params", () => {
  it("parses canonical compare report query params", () => {
    const parsed = parseCompareReportSearchParams(
      new URLSearchParams(
        "baseCtprvnCd=11&baseSignguCd=11680&targetCtprvnCd=11&targetSignguCd=11440&indsLclsCd=I2",
      ),
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.base.signguCd).toBe("11680");
      expect(parsed.value.target.signguCd).toBe("11440");
      expect(parsed.value.category?.indsLclsCd).toBe("I2");
    }
  });

  it("supports legacy compare query aliases", () => {
    const parsed = parseCompareReportSearchParams(
      new URLSearchParams("baseSido=11&baseSigungu=11680&targetSido=11&targetSigungu=11440&large=I2"),
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.base.ctprvnCd).toBe("11");
      expect(parsed.value.category?.indsLclsCd).toBe("I2");
    }
  });

  it("rejects missing required region params", () => {
    const parsed = parseCompareReportSearchParams(new URLSearchParams("baseCtprvnCd=11"));

    expect(parsed.ok).toBe(false);
  });

  it("serializes query without all or empty values", () => {
    const params = reportQueryToSearchParams({
      base: { ctprvnCd: "11", signguCd: "11680", adongCd: "all" },
      target: { ctprvnCd: "11", signguCd: "11440" },
      category: { indsLclsCd: "I2", indsMclsCd: "" },
    });

    expect(params.get("baseCtprvnCd")).toBe("11");
    expect(params.has("baseAdongCd")).toBe(false);
    expect(params.has("indsMclsCd")).toBe(false);
  });
});
