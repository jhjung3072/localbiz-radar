import type {
  CandidateItem,
  CandidateRegion,
  CandidateSource,
  CandidateStore,
} from "@/features/explore/types";

export const CANDIDATE_TRAY_STORAGE_KEY = "localbiz-radar:candidate-tray";
export const MAX_CANDIDATE_COUNT = 6;

export function createCandidateRegion(input: {
  ctprvnCd?: string;
  ctprvnNm?: string;
  signguCd?: string;
  signguNm?: string;
  adongCd?: string;
  adongNm?: string;
  source: CandidateSource;
}): CandidateRegion | null {
  if (!(input.signguCd || input.signguNm)) {
    return null;
  }

  const region: CandidateRegion = {
    type: "REGION",
    id: regionCandidateId(input),
    ctprvnCd: input.ctprvnCd ?? "",
    ctprvnNm: input.ctprvnNm ?? "",
    signguCd: input.signguCd ?? "",
    signguNm: input.signguNm ?? "",
    adongCd: emptyToUndefined(input.adongCd),
    adongNm: emptyToUndefined(input.adongNm),
    source: input.source,
    addedAt: new Date().toISOString(),
  };

  return region;
}

export function createCandidateStore(input: {
  storeId: number;
  storeName: string;
  categoryName: string;
  ctprvnCd?: string;
  ctprvnNm?: string;
  signguCd?: string;
  signguNm?: string;
  adongCd?: string;
  adongNm?: string;
  latitude?: number | null;
  longitude?: number | null;
}): CandidateStore {
  return {
    type: "STORE",
    id: `store:${input.storeId}`,
    storeId: input.storeId,
    storeName: input.storeName,
    categoryName: input.categoryName,
    ctprvnCd: input.ctprvnCd ?? "",
    ctprvnNm: input.ctprvnNm ?? "",
    signguCd: input.signguCd ?? "",
    signguNm: input.signguNm ?? "",
    adongCd: emptyToUndefined(input.adongCd),
    adongNm: emptyToUndefined(input.adongNm),
    latitude: input.latitude ?? undefined,
    longitude: input.longitude ?? undefined,
    addedAt: new Date().toISOString(),
  };
}

export function addCandidate(
  candidates: CandidateItem[],
  candidate: CandidateItem,
) {
  const withoutDuplicate = candidates.filter((item) => item.id !== candidate.id);
  return [candidate, ...withoutDuplicate].slice(0, MAX_CANDIDATE_COUNT);
}

export function removeCandidate(candidates: CandidateItem[], candidateId: string) {
  return candidates.filter((item) => item.id !== candidateId);
}

export function parseCandidateTray(value: string | null): CandidateItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as CandidateItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((candidate) => candidate?.id && candidate?.type)
      .slice(0, MAX_CANDIDATE_COUNT);
  } catch {
    return [];
  }
}

export function stringifyCandidateTray(candidates: CandidateItem[]) {
  return JSON.stringify(candidates.slice(0, MAX_CANDIDATE_COUNT));
}

export function candidateToCompareSearchParams(
  base: CandidateItem,
  target: CandidateItem,
) {
  const params = new URLSearchParams();
  appendCandidate(params, "base", base);
  appendCandidate(params, "target", target);
  return params;
}

function appendCandidate(
  params: URLSearchParams,
  prefix: "base" | "target",
  candidate: CandidateItem,
) {
  const legacyPrefix = prefix === "base" ? "base" : "target";

  append(params, `${prefix}CtprvnCd`, candidate.ctprvnCd);
  append(params, `${prefix}CtprvnNm`, candidate.ctprvnNm);
  append(params, `${prefix}SignguCd`, candidate.signguCd);
  append(params, `${prefix}SignguNm`, candidate.signguNm);
  append(params, `${prefix}AdongCd`, candidate.adongCd);
  append(params, `${prefix}AdongNm`, candidate.adongNm);

  append(params, `${legacyPrefix}Sido`, candidate.ctprvnCd);
  append(params, `${legacyPrefix}Sigungu`, candidate.signguCd);
  append(params, `${legacyPrefix}Dong`, candidate.adongCd);
}

function append(params: URLSearchParams, key: string, value?: string) {
  if (value && value !== "all") {
    params.set(key, value);
  }
}

function regionCandidateId(input: {
  ctprvnCd?: string;
  ctprvnNm?: string;
  signguCd?: string;
  signguNm?: string;
  adongCd?: string;
  adongNm?: string;
}) {
  return [
    "region",
    input.ctprvnCd || input.ctprvnNm || "unknown-sido",
    input.signguCd || input.signguNm || "unknown-sigungu",
    input.adongCd || input.adongNm || "all",
  ].join(":");
}

function emptyToUndefined(value?: string) {
  return value && value !== "all" ? value : undefined;
}
