export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type StoreListItem = {
  id: number;
  storeName: string;
  categoryLargeCode: string;
  categoryLargeName: string;
  categoryMediumCode: string;
  categoryMediumName: string;
  categorySmallCode: string;
  categorySmallName: string;
  sido: string;
  sigungu: string;
  dong: string;
  roadAddress: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type StoreSearchParams = {
  keyword?: string;
  sido?: string;
  sigungu?: string;
  dong?: string;
  categoryLargeCode?: string;
  categoryMediumCode?: string;
  categorySmallCode?: string;
  page: number;
  size: number;
};

export type StoreCategory = {
  largeCode: string;
  largeName: string;
  mediumCategories: MediumCategory[];
};

export type MediumCategory = {
  mediumCode: string;
  mediumName: string;
  smallCategories: SmallCategory[];
};

export type SmallCategory = {
  smallCode: string;
  smallName: string;
};

export type Region = {
  sidoCode: string;
  sidoName: string;
  sigunguList: Sigungu[];
};

export type Sigungu = {
  sigunguCode: string;
  sigunguName: string;
  dongList: Dong[];
};

export type Dong = {
  dongCode: string;
  dongName: string;
};
