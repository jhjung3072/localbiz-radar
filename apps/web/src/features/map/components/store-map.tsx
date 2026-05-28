"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ListChecks, Loader2, MapPin } from "lucide-react";
import {
  Map as KakaoMap,
  MapMarker,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import { Button } from "@/components/ui/button";
import { getRegions, getStoreCategories } from "@/features/stores/api/store-api";
import { storeQueryKeys } from "@/features/stores/api/store-query-keys";
import {
  getMapStores,
  getNearbyStores,
} from "@/features/map/api/map-api";
import { mapQueryKeys } from "@/features/map/api/map-query-keys";
import { MapEmptyState } from "@/features/map/components/map-empty-state";
import { MapErrorState } from "@/features/map/components/map-error-state";
import { MapFilterPanel } from "@/features/map/components/map-filter-panel";
import { NearbySearchPanel } from "@/features/map/components/nearby-search-panel";
import { StoreDetailPanel } from "@/features/map/components/store-detail-panel";
import type {
  MapBounds,
  MapCenter,
  MapStoreSearchParams,
  NearbyStoreSearchParams,
  StoreMapItem,
  StoreNearbyItem,
} from "@/features/map/types";
import { addSafeBreadcrumb } from "@/lib/sentry-utils";

const DEFAULT_CENTER: MapCenter = {
  lat: 37.497952,
  lng: 127.027619,
};
const MAP_LIMIT = 500;
const NEARBY_LIMIT = 100;

export function StoreMap() {
  const [sido, setSido] = useState("11");
  const [sigungu, setSigungu] = useState("11680");
  const [dong, setDong] = useState("all");
  const [categoryLargeCode, setCategoryLargeCode] = useState("all");
  const [categoryMediumCode, setCategoryMediumCode] = useState("all");
  const [categorySmallCode, setCategorySmallCode] = useState("all");
  const [radius, setRadius] = useState(500);
  const [center, setCenter] = useState<MapCenter>(DEFAULT_CENTER);
  const [viewport, setViewport] = useState<MapBounds | null>(null);
  const [selectedStore, setSelectedStore] = useState<
    StoreMapItem | StoreNearbyItem | null
  >(null);
  const [nearbyParams, setNearbyParams] =
    useState<NearbyStoreSearchParams | null>(null);

  const categoriesQuery = useQuery({
    queryKey: storeQueryKeys.categories(),
    queryFn: getStoreCategories,
  });
  const regionsQuery = useQuery({
    queryKey: storeQueryKeys.regions(),
    queryFn: getRegions,
  });
  const selectedSido = regionsQuery.data?.find(
    (region) => region.sidoCode === sido,
  );
  const selectedSigungu = selectedSido?.sigunguList.find(
    (option) => option.sigunguCode === sigungu,
  );
  const selectedDong = selectedSigungu?.dongList.find(
    (option) => option.dongCode === dong,
  );

  const mapParams = useMemo<MapStoreSearchParams>(
    () => ({
      sido: normalizeSelectValue(selectedSido?.sidoName ?? "all"),
      sigungu: normalizeSelectValue(selectedSigungu?.sigunguName ?? "all"),
      dong: normalizeSelectValue(selectedDong?.dongName ?? "all"),
      categoryLargeCode: normalizeSelectValue(categoryLargeCode),
      categoryMediumCode: normalizeSelectValue(categoryMediumCode),
      categorySmallCode: normalizeSelectValue(categorySmallCode),
      minLat: viewport?.minLat,
      maxLat: viewport?.maxLat,
      minLng: viewport?.minLng,
      maxLng: viewport?.maxLng,
      limit: MAP_LIMIT,
    }),
    [
      categoryLargeCode,
      categoryMediumCode,
      categorySmallCode,
      selectedDong,
      selectedSido,
      selectedSigungu,
      viewport,
    ],
  );
  const mapStoresQuery = useQuery({
    queryKey: mapQueryKeys.stores(mapParams),
    queryFn: () => getMapStores(mapParams),
  });
  const nearbyStoresQuery = useQuery({
    queryKey: mapQueryKeys.nearby(nearbyParams),
    queryFn: () => getNearbyStores(nearbyParams as NearbyStoreSearchParams),
    enabled: nearbyParams !== null,
  });

  const nearbyStores = useMemo(
    () => nearbyStoresQuery.data ?? [],
    [nearbyStoresQuery.data],
  );
  const nearbyStoreIds = useMemo(
    () => new Set(nearbyStores.map((store) => store.id)),
    [nearbyStores],
  );
  const markerStores = useMemo(
    () => mergeStores(mapStoresQuery.data ?? [], nearbyStores),
    [mapStoresQuery.data, nearbyStores],
  );
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
  const isFilterLoading = categoriesQuery.isLoading || regionsQuery.isLoading;

  function resetNearbyState() {
    setNearbyParams(null);
    setSelectedStore(null);
  }

  const handleCenterChange = useCallback((nextCenter: MapCenter) => {
    setCenter((currentCenter) =>
      isSameCenter(currentCenter, nextCenter) ? currentCenter : nextCenter,
    );
  }, []);

  function handleNearbySearch() {
    addSafeBreadcrumb("map.nearby-search", "지도 반경 검색 실행", {
      radius,
      hasCategory: categoryLargeCode !== "all",
    });
    setNearbyParams({
      lat: center.lat,
      lng: center.lng,
      radius,
      categoryLargeCode: normalizeSelectValue(categoryLargeCode),
      categoryMediumCode: normalizeSelectValue(categoryMediumCode),
      categorySmallCode: normalizeSelectValue(categorySmallCode),
      limit: NEARBY_LIMIT,
    });
  }

  const handleSelectStore = useCallback((store: StoreMapItem | StoreNearbyItem) => {
    setSelectedStore(store);
    handleCenterChange({ lat: store.latitude, lng: store.longitude });
  }, [handleCenterChange]);

  const handleViewportChange = useCallback((nextViewport: MapBounds) => {
    setViewport((currentViewport) =>
      isSameViewport(currentViewport, nextViewport) ? currentViewport : nextViewport,
    );
  }, []);

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <MapFilterPanel
          sido={sido}
          sigungu={sigungu}
          dong={dong}
          categoryLargeCode={categoryLargeCode}
          categoryMediumCode={categoryMediumCode}
          categorySmallCode={categorySmallCode}
          radius={radius}
          regions={regionsQuery.data ?? []}
          categories={categoriesQuery.data ?? []}
          isLoading={isFilterLoading}
          markerCount={mapStoresQuery.data?.length ?? 0}
          isNearbyLoading={nearbyStoresQuery.isFetching}
          onSidoChange={(value) => {
            setSido(value);
            setSigungu("all");
            setDong("all");
            resetNearbyState();
          }}
          onSigunguChange={(value) => {
            setSigungu(value);
            setDong("all");
            resetNearbyState();
          }}
          onDongChange={(value) => {
            setDong(value);
            resetNearbyState();
          }}
          onCategoryLargeChange={(value) => {
            setCategoryLargeCode(value);
            setCategoryMediumCode("all");
            setCategorySmallCode("all");
            resetNearbyState();
          }}
          onCategoryMediumChange={(value) => {
            setCategoryMediumCode(value);
            setCategorySmallCode("all");
            resetNearbyState();
          }}
          onCategorySmallChange={(value) => {
            setCategorySmallCode(value);
            resetNearbyState();
          }}
          onRadiusChange={setRadius}
          onNearbySearch={handleNearbySearch}
        />

        <StoreDetailPanel store={selectedStore} />
      </div>

      <div className="space-y-4">
        {!appKey ? (
          <MapEmptyState
            title="지도 API 키가 설정되지 않았습니다"
            description="Kakao Maps JavaScript Key를 NEXT_PUBLIC_KAKAO_MAP_APP_KEY 이름으로 apps/web/.env.local에 설정해 주세요."
          />
        ) : (
          <KakaoStoreMap
            appKey={appKey}
            center={center}
            stores={markerStores}
            nearbyStoreIds={nearbyStoreIds}
            selectedStore={selectedStore}
            isStoreLoading={mapStoresQuery.isLoading || mapStoresQuery.isFetching}
            isStoreError={mapStoresQuery.isError}
            onCenterChange={handleCenterChange}
            onViewportChange={handleViewportChange}
            onSelectStore={handleSelectStore}
            onRetry={() => mapStoresQuery.refetch()}
          />
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <StoreListPanel
            stores={mapStoresQuery.data ?? []}
            isLoading={mapStoresQuery.isLoading}
            isError={mapStoresQuery.isError}
            onSelectStore={handleSelectStore}
            onRetry={() => mapStoresQuery.refetch()}
          />
          <NearbySearchPanel
            center={center}
            radius={radius}
            stores={nearbyStores}
            isLoading={nearbyStoresQuery.isFetching}
            isError={nearbyStoresQuery.isError}
            hasSearched={nearbyParams !== null}
            onRetry={() => nearbyStoresQuery.refetch()}
            onSelectStore={handleSelectStore}
          />
        </div>
      </div>
    </div>
  );
}

type KakaoStoreMapProps = {
  appKey: string;
  center: MapCenter;
  stores: StoreMapItem[];
  nearbyStoreIds: Set<number>;
  selectedStore: StoreMapItem | StoreNearbyItem | null;
  isStoreLoading: boolean;
  isStoreError: boolean;
  onCenterChange: (center: MapCenter) => void;
  onViewportChange: (bounds: MapBounds) => void;
  onSelectStore: (store: StoreMapItem) => void;
  onRetry: () => void;
};

function KakaoStoreMap({
  appKey,
  center,
  stores,
  nearbyStoreIds,
  selectedStore,
  isStoreLoading,
  isStoreError,
  onCenterChange,
  onViewportChange,
  onSelectStore,
  onRetry,
}: KakaoStoreMapProps) {
  const [isMapLoading, mapLoadError] = useKakaoLoader({
    appkey: appKey,
  });
  const handleMapReady = useCallback(
    (map: kakao.maps.Map) => {
      onCenterChange(readCenter(map));
      onViewportChange(readBounds(map));
    },
    [onCenterChange, onViewportChange],
  );

  if (mapLoadError) {
    return (
      <MapErrorState
        title="Kakao Maps를 불러오지 못했습니다"
        description="JavaScript Key와 Kakao Developers의 JavaScript SDK 도메인 등록 상태를 확인해 주세요."
      />
    );
  }

  return (
    <section
      aria-label="점포 분포 지도"
      className="relative min-h-[520px] overflow-hidden rounded-[8px] border border-slate-200 bg-slate-100 shadow-sm"
    >
      <KakaoMap
        center={center}
        isPanto
        level={5}
        className="h-[520px] w-full"
        onCreate={handleMapReady}
        onIdle={handleMapReady}
      >
        {stores.map((store) => {
          const isNearbyStore = nearbyStoreIds.has(store.id);
          const isSelected = selectedStore?.id === store.id;

          return (
            <MapMarker
              key={store.id}
              position={{ lat: store.latitude, lng: store.longitude }}
              title={`${store.storeName} ${store.categorySmallName}`}
              image={isNearbyStore ? nearbyMarkerImage : defaultMarkerImage}
              zIndex={isSelected ? 10 : isNearbyStore ? 5 : 1}
              onClick={() => onSelectStore(store)}
            >
              {isSelected ? (
                <div className="min-w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-lg">
                  <p className="font-semibold text-slate-950">{store.storeName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {store.categorySmallName}
                  </p>
                </div>
              ) : null}
            </MapMarker>
          );
        })}
      </KakaoMap>

      {isMapLoading || isStoreLoading ? (
        <div className="absolute inset-x-4 top-4 flex items-center gap-2 rounded-md border border-teal-100 bg-white/95 px-3 py-2 text-sm font-medium text-teal-800 shadow-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          지도와 점포 marker를 불러오는 중입니다.
        </div>
      ) : null}

      {isStoreError ? (
        <div className="absolute inset-x-4 bottom-4">
          <MapErrorState onRetry={onRetry} />
        </div>
      ) : null}

      {!isStoreLoading && !isStoreError && stores.length === 0 ? (
        <div className="absolute inset-x-4 bottom-4">
          <MapEmptyState
            title="조건에 맞는 점포가 없습니다"
            description="지역 또는 업종 필터를 넓히거나 지도를 다른 위치로 이동해 주세요."
          />
        </div>
      ) : null}
    </section>
  );
}

type StoreListPanelProps = {
  stores: StoreMapItem[];
  isLoading: boolean;
  isError: boolean;
  onSelectStore: (store: StoreMapItem) => void;
  onRetry: () => void;
};

function StoreListPanel({
  stores,
  isLoading,
  isError,
  onSelectStore,
  onRetry,
}: StoreListPanelProps) {
  return (
    <section
      aria-label="지도 점포 목록"
      className="rounded-[8px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <ListChecks className="size-4 text-teal-700" aria-hidden="true" />
          지도 내 점포
        </h2>
        <span className="text-sm text-slate-500">
          {stores.length.toLocaleString("ko-KR")}개
        </span>
      </div>

      <div className="max-h-[320px] overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-md border border-slate-100 bg-slate-50"
              />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">
            <p className="font-semibold">점포 정보를 불러오지 못했습니다.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
              onClick={onRetry}
            >
              다시 시도
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && stores.length === 0 ? (
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
            조건에 맞는 점포가 없습니다.
          </div>
        ) : null}

        {!isLoading && !isError && stores.length > 0 ? (
          <ul className="space-y-2">
            {stores.map((store) => (
              <li key={store.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/30"
                  onClick={() => onSelectStore(store)}
                >
                  <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                    <MapPin className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">
                      {store.storeName}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {store.categorySmallName} · {store.sigungu} {store.dong}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {store.roadAddress ?? "도로명 주소 없음"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function normalizeSelectValue(value: string) {
  return value === "all" ? undefined : value;
}

function mergeStores(mapStores: StoreMapItem[], nearbyStores: StoreNearbyItem[]) {
  const storesById = new globalThis.Map<number, StoreMapItem>();

  mapStores.forEach((store) => storesById.set(store.id, store));
  nearbyStores.forEach((store) => storesById.set(store.id, store));

  return Array.from(storesById.values());
}

function readCenter(map: kakao.maps.Map): MapCenter {
  const nextCenter = map.getCenter();
  return {
    lat: nextCenter.getLat(),
    lng: nextCenter.getLng(),
  };
}

function readBounds(map: kakao.maps.Map): MapBounds {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  return {
    minLat: southWest.getLat(),
    maxLat: northEast.getLat(),
    minLng: southWest.getLng(),
    maxLng: northEast.getLng(),
  };
}

function isSameViewport(currentViewport: MapBounds | null, nextViewport: MapBounds) {
  if (!currentViewport) {
    return false;
  }

  return (
    Math.abs(currentViewport.minLat - nextViewport.minLat) < 0.00001 &&
    Math.abs(currentViewport.maxLat - nextViewport.maxLat) < 0.00001 &&
    Math.abs(currentViewport.minLng - nextViewport.minLng) < 0.00001 &&
    Math.abs(currentViewport.maxLng - nextViewport.maxLng) < 0.00001
  );
}

function isSameCenter(currentCenter: MapCenter, nextCenter: MapCenter) {
  return (
    Math.abs(currentCenter.lat - nextCenter.lat) < 0.000001 &&
    Math.abs(currentCenter.lng - nextCenter.lng) < 0.000001
  );
}

const defaultMarkerImage = {
  src: createMarkerImage("#0f766e", "#134e4a"),
  size: { width: 30, height: 36 },
  options: {
    offset: { x: 15, y: 36 },
    alt: "점포 marker",
  },
};

const nearbyMarkerImage = {
  src: createMarkerImage("#d97706", "#92400e"),
  size: { width: 30, height: 36 },
  options: {
    offset: { x: 15, y: 36 },
    alt: "반경 검색 점포 marker",
  },
};

function createMarkerImage(fill: string, stroke: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="36" viewBox="0 0 30 36"><path fill="${fill}" stroke="${stroke}" stroke-width="2" d="M15 35s12-11.1 12-21A12 12 0 0 0 3 14c0 9.9 12 21 12 21Z"/><circle cx="15" cy="14" r="4.5" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
