import type { CompareReportQuery, CompareReportQueryParseResult } from "@/features/reports/types";

const ALL_VALUE = "all";
type SearchParamsReader = Pick<URLSearchParams, "get">;

export function parseCompareReportSearchParams(
  params: SearchParamsReader,
): CompareReportQueryParseResult {
  const base = {
    ctprvnCd: getParam(params, "baseCtprvnCd", "baseSido"),
    ctprvnNm: getParam(params, "baseCtprvnNm"),
    signguCd: getParam(params, "baseSignguCd", "baseSigungu"),
    signguNm: getParam(params, "baseSignguNm"),
    adongCd: getParam(params, "baseAdongCd", "baseDong"),
    adongNm: getParam(params, "baseAdongNm"),
  };
  const target = {
    ctprvnCd: getParam(params, "targetCtprvnCd", "targetSido"),
    ctprvnNm: getParam(params, "targetCtprvnNm"),
    signguCd: getParam(params, "targetSignguCd", "targetSigungu"),
    signguNm: getParam(params, "targetSignguNm"),
    adongCd: getParam(params, "targetAdongCd", "targetDong"),
    adongNm: getParam(params, "targetAdongNm"),
  };

  if (!base.ctprvnCd || !base.signguCd || !target.ctprvnCd || !target.signguCd) {
    return {
      ok: false,
      message: "기준 지역과 비교 지역의 시도/시군구 코드가 필요합니다.",
    };
  }

  const category = compact({
    indsLclsCd: getParam(params, "indsLclsCd", "large"),
    indsLclsNm: getParam(params, "indsLclsNm"),
    indsMclsCd: getParam(params, "indsMclsCd", "medium"),
    indsMclsNm: getParam(params, "indsMclsNm"),
    indsSclsCd: getParam(params, "indsSclsCd", "small"),
    indsSclsNm: getParam(params, "indsSclsNm"),
  });

  return {
    ok: true,
    value: {
      base: compact(base),
      target: compact(target),
      category: Object.keys(category).length > 0 ? category : undefined,
    },
  };
}

export function reportQueryToSearchParams(query: CompareReportQuery) {
  const params = new URLSearchParams();

  setParam(params, "baseCtprvnCd", query.base.ctprvnCd);
  setParam(params, "baseCtprvnNm", query.base.ctprvnNm);
  setParam(params, "baseSignguCd", query.base.signguCd);
  setParam(params, "baseSignguNm", query.base.signguNm);
  setParam(params, "baseAdongCd", query.base.adongCd);
  setParam(params, "baseAdongNm", query.base.adongNm);
  setParam(params, "targetCtprvnCd", query.target.ctprvnCd);
  setParam(params, "targetCtprvnNm", query.target.ctprvnNm);
  setParam(params, "targetSignguCd", query.target.signguCd);
  setParam(params, "targetSignguNm", query.target.signguNm);
  setParam(params, "targetAdongCd", query.target.adongCd);
  setParam(params, "targetAdongNm", query.target.adongNm);
  setParam(params, "indsLclsCd", query.category?.indsLclsCd);
  setParam(params, "indsLclsNm", query.category?.indsLclsNm);
  setParam(params, "indsMclsCd", query.category?.indsMclsCd);
  setParam(params, "indsMclsNm", query.category?.indsMclsNm);
  setParam(params, "indsSclsCd", query.category?.indsSclsCd);
  setParam(params, "indsSclsNm", query.category?.indsSclsNm);

  return params;
}

export function searchParamsFromRecord(
  params?: Record<string, string | string[] | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => setParam(searchParams, key, item));
      return;
    }
    setParam(searchParams, key, value);
  });

  return searchParams;
}

function getParam(params: SearchParamsReader, key: string, fallbackKey?: string) {
  const value = normalizeParam(params.get(key));
  if (value) {
    return value;
  }
  return fallbackKey ? normalizeParam(params.get(fallbackKey)) : undefined;
}

function setParam(params: URLSearchParams, key: string, value?: string) {
  if (value && value !== ALL_VALUE) {
    params.set(key, value);
  }
}

function normalizeParam(value: string | null) {
  if (!value || value === ALL_VALUE) {
    return undefined;
  }
  return value.trim() || undefined;
}

function compact<T extends Record<string, string | undefined>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== ""),
  ) as { [K in keyof T]?: string };
}
