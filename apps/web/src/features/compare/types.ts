import type { MasterCategory, MasterRegion } from "@/features/master/types";

export type CompareAreaPayload = {
  ctprvnCd?: string;
  ctprvnNm?: string;
  signguCd?: string;
  signguNm?: string;
  adongCd?: string;
  adongNm?: string;
};

export type CompareCategoryPayload = {
  indsLclsCd?: string;
  indsLclsNm?: string;
  indsMclsCd?: string;
  indsMclsNm?: string;
  indsSclsCd?: string;
  indsSclsNm?: string;
};

export type CompareRegionsPayload = {
  base: CompareAreaPayload;
  target: CompareAreaPayload;
  category?: CompareCategoryPayload;
};

export type CategoryDistributionItem = {
  categoryCode: string;
  categoryName: string;
  storeCount: number;
  ratio: number;
};

export type CompareAreaResult = {
  regionLabel: string;
  totalStores: number;
  categoryStoreCount: number;
  categoryShare: number;
  totalCategories: number;
  topCategoryName: string;
  competitionIndex: number;
  categoryDiversityScore: number;
  densityScore: number;
  localBizScore: number;
  topCategories: CategoryDistributionItem[];
};

export type MetricComparison = {
  metricKey: string;
  metricName: string;
  baseValue: number;
  targetValue: number;
  winner: "BASE" | "TARGET" | "TIE";
};

export type CompareRegionsResult = {
  base: CompareAreaResult;
  target: CompareAreaResult;
  winner: {
    regionLabel: string;
    scoreGap: number;
    reason: string;
  };
  metricComparisons: MetricComparison[];
};

export type RegionRankingParams = {
  ctprvnCd?: string;
  signguCd?: string;
  groupBy?: "SIGUNGU" | "ADMIN_DONG";
  indsLclsCd?: string;
  indsMclsCd?: string;
  indsSclsCd?: string;
  limit?: number;
};

export type RegionRankingItem = {
  rank: number;
  ctprvnCd: string | null;
  ctprvnNm: string | null;
  signguCd: string | null;
  signguNm: string | null;
  adongCd: string | null;
  adongNm: string | null;
  regionLabel: string;
  totalStores: number;
  categoryStoreCount: number;
  competitionIndex: number;
  categoryDiversityScore: number;
  densityScore: number;
  localBizScore: number;
};

export type CompareSelection = {
  baseSido: string;
  baseSigungu: string;
  baseDong: string;
  targetSido: string;
  targetSigungu: string;
  targetDong: string;
  large: string;
  medium: string;
  small: string;
};

export type CompareOptionContext = {
  regions: MasterRegion[];
  categories: MasterCategory[];
};
