import { describe, expect, it } from "vitest";
import {
  addCandidate,
  createCandidateRegion,
  createCandidateStore,
  MAX_CANDIDATE_COUNT,
} from "@/features/explore/lib/candidate-storage";

describe("candidate-storage", () => {
  it("prevents duplicate candidates", () => {
    const candidate = createCandidateRegion({
      ctprvnCd: "11",
      ctprvnNm: "서울특별시",
      signguCd: "11680",
      signguNm: "강남구",
      source: "STORES",
    });

    expect(candidate).not.toBeNull();
    const first = addCandidate([], candidate!);
    const second = addCandidate(first, candidate!);

    expect(second).toHaveLength(1);
  });

  it("keeps candidate tray under max count", () => {
    const candidates = Array.from({ length: 8 }).reduce((items, _, index) => {
      return addCandidate(
        items,
        createCandidateStore({
          storeId: index,
          storeName: `테스트 점포 ${index}`,
          categoryName: "커피전문점",
          ctprvnNm: "서울특별시",
          signguNm: "강남구",
        }),
      );
    }, [] as ReturnType<typeof createCandidateStore>[]);

    expect(candidates).toHaveLength(MAX_CANDIDATE_COUNT);
    expect(candidates[0].storeId).toBe(7);
  });
});
