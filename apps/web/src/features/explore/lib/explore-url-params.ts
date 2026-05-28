import {
  DEFAULT_EXPLORE_QUERY,
  exploreQuerySchema,
} from "@/features/explore/lib/explore-query-schema";
import type { ExploreQueryState } from "@/features/explore/types";

export function parseExploreSearchParams(
  params: URLSearchParams,
): ExploreQueryState {
  const raw = Object.fromEntries(params.entries());
  return exploreQuerySchema.parse({
    ...DEFAULT_EXPLORE_QUERY,
    ...raw,
  });
}

export function serializeExploreQuery(
  query: ExploreQueryState,
  options?: { includePaging?: boolean; includeMap?: boolean },
) {
  const params = new URLSearchParams();
  const includePaging = options?.includePaging ?? true;
  const includeMap = options?.includeMap ?? true;

  appendString(params, "keyword", query.keyword);
  appendSelect(params, "ctprvnCd", query.ctprvnCd);
  appendString(params, "ctprvnNm", query.ctprvnNm);
  appendSelect(params, "signguCd", query.signguCd);
  appendString(params, "signguNm", query.signguNm);
  appendSelect(params, "adongCd", query.adongCd);
  appendString(params, "adongNm", query.adongNm);
  appendSelect(params, "indsLclsCd", query.indsLclsCd);
  appendString(params, "indsLclsNm", query.indsLclsNm);
  appendSelect(params, "indsMclsCd", query.indsMclsCd);
  appendString(params, "indsMclsNm", query.indsMclsNm);
  appendSelect(params, "indsSclsCd", query.indsSclsCd);
  appendString(params, "indsSclsNm", query.indsSclsNm);

  if (includePaging) {
    if (query.page > 0) {
      params.set("page", String(query.page));
    }
    if (query.size !== DEFAULT_EXPLORE_QUERY.size) {
      params.set("size", String(query.size));
    }
  }

  if (includeMap) {
    appendNumber(params, "lat", query.lat);
    appendNumber(params, "lng", query.lng);
    if (query.radius !== DEFAULT_EXPLORE_QUERY.radius) {
      params.set("radius", String(query.radius));
    }
    appendNumber(params, "zoom", query.zoom);
  }

  return params;
}

export function mergeExploreQuery(
  current: ExploreQueryState,
  patch: Partial<ExploreQueryState>,
) {
  return exploreQuerySchema.parse({
    ...current,
    ...patch,
  });
}

export function clearRegionQuery(query: ExploreQueryState): ExploreQueryState {
  return {
    ...query,
    ctprvnCd: "all",
    ctprvnNm: "",
    signguCd: "all",
    signguNm: "",
    adongCd: "all",
    adongNm: "",
    page: 0,
  };
}

export function clearCategoryQuery(query: ExploreQueryState): ExploreQueryState {
  return {
    ...query,
    indsLclsCd: "all",
    indsLclsNm: "",
    indsMclsCd: "all",
    indsMclsNm: "",
    indsSclsCd: "all",
    indsSclsNm: "",
    page: 0,
  };
}

export function hasExploreFilters(query: ExploreQueryState) {
  return Boolean(
    query.keyword ||
      query.ctprvnCd !== "all" ||
      query.signguCd !== "all" ||
      query.adongCd !== "all" ||
      query.indsLclsCd !== "all" ||
      query.indsMclsCd !== "all" ||
      query.indsSclsCd !== "all",
  );
}

function appendString(params: URLSearchParams, key: string, value?: string) {
  if (value?.trim()) {
    params.set(key, value.trim());
  }
}

function appendSelect(params: URLSearchParams, key: string, value?: string) {
  if (value && value !== "all") {
    params.set(key, value);
  }
}

function appendNumber(params: URLSearchParams, key: string, value?: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    params.set(key, String(value));
  }
}
