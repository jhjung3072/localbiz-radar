export type MapBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type MapCenter = {
  lat: number;
  lng: number;
};

export type MapStoreSearchParams = {
  sido?: string;
  sigungu?: string;
  dong?: string;
  categoryLargeCode?: string;
  categoryMediumCode?: string;
  categorySmallCode?: string;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  limit?: number;
};

export type NearbyStoreSearchParams = {
  lat: number;
  lng: number;
  radius?: number;
  categoryLargeCode?: string;
  categoryMediumCode?: string;
  categorySmallCode?: string;
  limit?: number;
};

export type StoreMapItem = {
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
  latitude: number;
  longitude: number;
};

export type StoreNearbyItem = StoreMapItem & {
  distanceMeters: number;
};
