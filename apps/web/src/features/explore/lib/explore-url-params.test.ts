import { describe, expect, it } from "vitest";
import {
  parseExploreSearchParams,
  serializeExploreQuery,
} from "@/features/explore/lib/explore-url-params";

describe("explore-url-params", () => {
  it("parses and serializes shared explore query state", () => {
    const parsed = parseExploreSearchParams(
      new URLSearchParams(
        "keyword=coffee&ctprvnCd=11&ctprvnNm=서울특별시&signguCd=11680&signguNm=강남구&indsLclsCd=I2&page=2&size=20&lat=37.5&lng=127.0&radius=1000",
      ),
    );

    expect(parsed).toMatchObject({
      keyword: "coffee",
      ctprvnCd: "11",
      signguCd: "11680",
      indsLclsCd: "I2",
      page: 2,
      size: 20,
      radius: 1000,
    });

    const serialized = serializeExploreQuery(parsed).toString();
    expect(serialized).toContain("keyword=coffee");
    expect(serialized).toContain("ctprvnCd=11");
    expect(serialized).toContain("page=2");
  });

  it("coerces invalid numeric query values to safe defaults", () => {
    const parsed = parseExploreSearchParams(
      new URLSearchParams("page=-1&size=999&lat=999&radius=99999"),
    );

    expect(parsed.page).toBe(0);
    expect(parsed.size).toBe(10);
    expect(parsed.lat).toBeUndefined();
    expect(parsed.radius).toBe(500);
  });
});
