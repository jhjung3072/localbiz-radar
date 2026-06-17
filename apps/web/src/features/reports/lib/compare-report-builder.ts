import type {
  CompareRegionsPayload,
  CompareRegionsResult,
  RegionRankingItem,
} from "@/features/compare/types";
import type { MasterCategory, MasterRegion } from "@/features/master/types";
import {
  buildCompareReportUrl,
  buildCompareUrlFromReportQuery,
} from "@/features/reports/lib/report-url";
import type { CompareReportData, CompareReportQuery } from "@/features/reports/types";

const SOURCE_NOTICE =
  "현재 리포트는 공공 상가정보 및 stores 데이터 기반의 개발용 분석 지표를 사용합니다. 유동인구와 추정매출 기반 분석은 이후 단계에서 추가됩니다.";

export function buildComparePayloadFromReportQuery(
  query: CompareReportQuery,
  regions: MasterRegion[],
  categories: MasterCategory[],
): CompareRegionsPayload {
  const base = resolveRegion(query.base, regions);
  const target = resolveRegion(query.target, regions);
  const category = resolveCategory(query.category, categories);

  return category ? { base, target, category } : { base, target };
}

export function createCompareReportData({
  query,
  comparePayload,
  result,
  regionRanking,
  generatedAt = new Date().toISOString(),
}: {
  query: CompareReportQuery;
  comparePayload: CompareRegionsPayload;
  result: CompareRegionsResult;
  regionRanking: RegionRankingItem[];
  generatedAt?: string;
}): CompareReportData {
  const baseLabel = result.base.regionLabel || regionLabel(comparePayload.base);
  const targetLabel = result.target.regionLabel || regionLabel(comparePayload.target);
  const categoryLabel = resolveCategoryLabel(comparePayload);

  return {
    reportTitle: `${shortRegionLabel(baseLabel)} vs ${shortRegionLabel(targetLabel)} ${categoryLabel} 상권 비교 리포트`,
    reportDescription: `${categoryLabel} 기준으로 점포 수, 경쟁 강도, 업종 다양성, LocalBiz 점수를 비교한 리포트입니다.`,
    comparePayload,
    base: result.base,
    target: result.target,
    winner: result.winner,
    metricComparisons: result.metricComparisons,
    regionRanking,
    categoryLabel,
    generatedAt,
    sourceNotice: SOURCE_NOTICE,
    compareUrl: buildCompareUrlFromReportQuery(query),
    reportUrl: buildCompareReportUrl(query),
  };
}

function resolveRegion(
  queryRegion: NonNullable<CompareReportQuery["base"]>,
  regions: MasterRegion[],
) {
  const sido = regions.find((region) => region.ctprvnCd === queryRegion.ctprvnCd);
  const sigungu = sido?.sigunguList.find(
    (item) => item.signguCd === queryRegion.signguCd,
  );
  const dong = sigungu?.adminDongList.find(
    (item) => item.code === queryRegion.adongCd,
  );

  return {
    ctprvnCd: queryRegion.ctprvnCd,
    ctprvnNm: queryRegion.ctprvnNm ?? sido?.ctprvnNm,
    signguCd: queryRegion.signguCd,
    signguNm: queryRegion.signguNm ?? sigungu?.signguNm,
    adongCd: queryRegion.adongCd,
    adongNm: queryRegion.adongNm ?? dong?.name,
  };
}

function resolveCategory(
  queryCategory: CompareReportQuery["category"],
  categories: MasterCategory[],
) {
  if (!queryCategory?.indsLclsCd) {
    return undefined;
  }

  const large = categories.find(
    (category) => category.indsLclsCd === queryCategory.indsLclsCd,
  );
  const medium = large?.mediumCategories.find(
    (category) => category.indsMclsCd === queryCategory.indsMclsCd,
  );
  const small = medium?.smallCategories.find(
    (category) => category.indsSclsCd === queryCategory.indsSclsCd,
  );

  return {
    indsLclsCd: queryCategory.indsLclsCd,
    indsLclsNm: queryCategory.indsLclsNm ?? large?.indsLclsNm,
    indsMclsCd: queryCategory.indsMclsCd,
    indsMclsNm: queryCategory.indsMclsNm ?? medium?.indsMclsNm,
    indsSclsCd: queryCategory.indsSclsCd,
    indsSclsNm: queryCategory.indsSclsNm ?? small?.indsSclsNm,
  };
}

function resolveCategoryLabel(payload: CompareRegionsPayload) {
  return (
    payload.category?.indsSclsNm ??
    payload.category?.indsMclsNm ??
    payload.category?.indsLclsNm ??
    "전체 업종"
  );
}

function regionLabel(region: CompareRegionsPayload["base"]) {
  return [region.ctprvnNm, region.signguNm, region.adongNm]
    .filter(Boolean)
    .join(" ");
}

function shortRegionLabel(label: string) {
  const parts = label.split(" ").filter(Boolean);
  return parts.at(-1) ?? label;
}
