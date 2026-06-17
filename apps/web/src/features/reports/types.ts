import type {
  CompareAreaPayload,
  CompareRegionsPayload,
  CompareRegionsResult,
  RegionRankingItem,
} from "@/features/compare/types";

export type CompareReportQuery = {
  base: CompareAreaPayload;
  target: CompareAreaPayload;
  category?: {
    indsLclsCd?: string;
    indsLclsNm?: string;
    indsMclsCd?: string;
    indsMclsNm?: string;
    indsSclsCd?: string;
    indsSclsNm?: string;
  };
};

export type CompareReportQueryParseResult =
  | {
      ok: true;
      value: CompareReportQuery;
    }
  | {
      ok: false;
      message: string;
    };

export type CompareReportData = {
  reportTitle: string;
  reportDescription: string;
  comparePayload: CompareRegionsPayload;
  base: CompareRegionsResult["base"];
  target: CompareRegionsResult["target"];
  winner: CompareRegionsResult["winner"];
  metricComparisons: CompareRegionsResult["metricComparisons"];
  regionRanking: RegionRankingItem[];
  categoryLabel: string;
  generatedAt: string;
  sourceNotice: string;
  compareUrl: string;
  reportUrl: string;
};
