import type { CandidateItem, ExploreQueryState } from "@/features/explore/types";

export function buildRegionLabel(
  region: Partial<
    Pick<
      ExploreQueryState,
      "ctprvnNm" | "signguNm" | "adongNm" | "ctprvnCd" | "signguCd" | "adongCd"
    >
  >,
) {
  const parts = [
    region.ctprvnNm || fallbackCode(region.ctprvnCd),
    region.signguNm || fallbackCode(region.signguCd),
    region.adongNm || fallbackCode(region.adongCd),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : "전체 지역";
}

export function candidateRegionLabel(candidate: CandidateItem) {
  return buildRegionLabel(candidate);
}

export function candidateCompareLabel(candidate: CandidateItem) {
  if (candidate.type === "STORE") {
    return `${candidate.storeName} 주변`;
  }

  return candidateRegionLabel(candidate);
}

function fallbackCode(value?: string) {
  return value && value !== "all" ? value : "";
}
