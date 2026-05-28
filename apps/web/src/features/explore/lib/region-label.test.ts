import { describe, expect, it } from "vitest";
import { buildRegionLabel } from "@/features/explore/lib/region-label";

describe("region-label", () => {
  it("builds readable region label from names", () => {
    expect(
      buildRegionLabel({
        ctprvnCd: "11",
        ctprvnNm: "서울특별시",
        signguCd: "11680",
        signguNm: "강남구",
        adongCd: "11680640",
        adongNm: "역삼1동",
      }),
    ).toBe("서울특별시 강남구 역삼1동");
  });

  it("falls back to code when name is not available", () => {
    expect(
      buildRegionLabel({
        ctprvnCd: "11",
        ctprvnNm: "",
        signguCd: "11680",
        signguNm: "",
        adongCd: "all",
        adongNm: "",
      }),
    ).toBe("11 11680");
  });
});
