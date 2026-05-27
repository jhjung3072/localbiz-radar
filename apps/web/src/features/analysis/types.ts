export type AnalysisFilterParams = {
  sido?: string;
  sigungu?: string;
  dong?: string;
  categoryLargeCode?: string;
  categoryMediumCode?: string;
  categorySmallCode?: string;
};

export type AnalysisSummary = {
  totalStores: number;
  totalCategories: number;
  topCategoryName: string;
  competitionIndex: number;
  categoryDiversityScore: number;
  localBizScore: number;
  selectedRegionLabel: string;
  selectedCategoryLabel: string;
};

export type CategoryDistributionDepth = "large" | "medium" | "small";

export type CategoryDistributionParams = {
  sido?: string;
  sigungu?: string;
  dong?: string;
  depth?: CategoryDistributionDepth;
};

export type CategoryDistributionItem = {
  categoryCode: string;
  categoryName: string;
  storeCount: number;
  ratio: number;
};

export type CompetitionParams = AnalysisFilterParams & {
  lat?: number;
  lng?: number;
  radius?: number;
};

export type Competition = {
  targetStoreCount: number;
  sameCategoryStoreCount: number;
  totalStoresInArea: number;
  competitionIndex: number;
  radius: number;
  unit: string;
  message: string;
};

export type CompareAreaPayload = AnalysisFilterParams & {
  sido: string;
  sigungu: string;
};

export type CompareAnalysisPayload = {
  base: CompareAreaPayload;
  target: CompareAreaPayload;
};

export type CompareAreaResult = {
  regionLabel: string;
  totalStores: number;
  totalCategories: number;
  topCategoryName: string;
  competitionIndex: number;
  categoryDiversityScore: number;
  localBizScore: number;
};

export type CompareAnalysisResult = {
  base: CompareAreaResult;
  target: CompareAreaResult;
  winner: {
    regionLabel: string;
    reason: string;
  };
};
