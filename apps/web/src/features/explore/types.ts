export const ALL_VALUE = "all";

export type ExploreQueryState = {
  keyword: string;
  ctprvnCd: string;
  ctprvnNm: string;
  signguCd: string;
  signguNm: string;
  adongCd: string;
  adongNm: string;
  indsLclsCd: string;
  indsLclsNm: string;
  indsMclsCd: string;
  indsMclsNm: string;
  indsSclsCd: string;
  indsSclsNm: string;
  page: number;
  size: number;
  lat?: number;
  lng?: number;
  radius: number;
  zoom?: number;
};

export type CandidateSource = "STORES" | "MAP" | "RANKING";

export type CandidateRegion = {
  type: "REGION";
  id: string;
  ctprvnCd: string;
  ctprvnNm: string;
  signguCd: string;
  signguNm: string;
  adongCd?: string;
  adongNm?: string;
  source: CandidateSource;
  addedAt: string;
};

export type CandidateStore = {
  type: "STORE";
  id: string;
  storeId: number;
  storeName: string;
  categoryName: string;
  ctprvnCd: string;
  ctprvnNm: string;
  signguCd: string;
  signguNm: string;
  adongCd?: string;
  adongNm?: string;
  latitude?: number;
  longitude?: number;
  addedAt: string;
};

export type CandidateItem = CandidateRegion | CandidateStore;

export type RecentExploreSearch = {
  label: string;
  path: "/stores" | "/map";
  query: string;
  createdAt: string;
};
