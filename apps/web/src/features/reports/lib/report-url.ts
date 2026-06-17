import type { CompareSelection } from "@/features/compare/types";
import type { MasterCategory, MasterRegion } from "@/features/master/types";
import {
  reportQueryToSearchParams,
} from "@/features/reports/api/report-query-params";
import type { CompareReportQuery } from "@/features/reports/types";

export function buildCompareReportUrl(
  query: CompareReportQuery,
  basePath = "/reports/compare",
) {
  const params = reportQueryToSearchParams(query);
  const serialized = params.toString();
  return serialized ? `${basePath}?${serialized}` : basePath;
}

export function buildCompareUrlFromReportQuery(query: CompareReportQuery) {
  const params = new URLSearchParams();

  setParam(params, "baseCtprvnCd", query.base.ctprvnCd);
  setParam(params, "baseSignguCd", query.base.signguCd);
  setParam(params, "baseAdongCd", query.base.adongCd);
  setParam(params, "targetCtprvnCd", query.target.ctprvnCd);
  setParam(params, "targetSignguCd", query.target.signguCd);
  setParam(params, "targetAdongCd", query.target.adongCd);
  setParam(params, "indsLclsCd", query.category?.indsLclsCd);
  setParam(params, "indsMclsCd", query.category?.indsMclsCd);
  setParam(params, "indsSclsCd", query.category?.indsSclsCd);

  const serialized = params.toString();
  return serialized ? `/compare?${serialized}` : "/compare";
}

export function buildReportQueryFromSelection(
  selection: CompareSelection,
  regions: MasterRegion[],
  categories: MasterCategory[],
): CompareReportQuery | null {
  const base = resolveRegion(
    selection.baseSido,
    selection.baseSigungu,
    selection.baseDong,
    regions,
  );
  const target = resolveRegion(
    selection.targetSido,
    selection.targetSigungu,
    selection.targetDong,
    regions,
  );

  if (!base || !target) {
    return null;
  }

  const category = resolveCategory(selection, categories);
  return category ? { base, target, category } : { base, target };
}

function resolveRegion(
  sidoCode: string,
  sigunguCode: string,
  dongCode: string,
  regions: MasterRegion[],
) {
  const sido = regions.find((region) => region.ctprvnCd === sidoCode);
  const sigungu = sido?.sigunguList.find((item) => item.signguCd === sigunguCode);
  const dong = sigungu?.adminDongList.find((item) => item.code === dongCode);

  if (!sido || !sigungu) {
    return null;
  }

  return {
    ctprvnCd: sido.ctprvnCd,
    ctprvnNm: sido.ctprvnNm,
    signguCd: sigungu.signguCd,
    signguNm: sigungu.signguNm,
    adongCd: dong?.code,
    adongNm: dong?.name,
  };
}

function resolveCategory(
  selection: CompareSelection,
  categories: MasterCategory[],
) {
  const large = categories.find((category) => category.indsLclsCd === selection.large);
  const medium = large?.mediumCategories.find(
    (category) => category.indsMclsCd === selection.medium,
  );
  const small = medium?.smallCategories.find(
    (category) => category.indsSclsCd === selection.small,
  );

  if (!large) {
    return undefined;
  }

  return {
    indsLclsCd: large.indsLclsCd,
    indsLclsNm: large.indsLclsNm,
    indsMclsCd: medium?.indsMclsCd,
    indsMclsNm: medium?.indsMclsNm,
    indsSclsCd: small?.indsSclsCd,
    indsSclsNm: small?.indsSclsNm,
  };
}

function setParam(params: URLSearchParams, key: string, value?: string) {
  if (value && value !== "all") {
    params.set(key, value);
  }
}
