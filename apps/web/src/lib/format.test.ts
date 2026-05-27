import { describe, expect, it } from "vitest";
import { formatCompactNumber, formatPercent } from "@/lib/format";

describe("format helpers", () => {
  it("formats dashboard values for Korean UI", () => {
    expect(formatCompactNumber(12800)).toBe("1.3만");
    expect(formatPercent(42.345)).toBe("42.3%");
  });
});
