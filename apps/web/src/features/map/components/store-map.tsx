"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookmarkPlus, Loader2, Search } from "lucide-react";
import {
  Map as KakaoMap,
  MapMarker,
  useKakaoLoader,
} from "react-kakao-maps-sdk";
import { Button } from "@/components/ui/button";
import { CandidateTray } from "@/features/explore/components/candidate-tray";
import { MapStoreList } from "@/features/explore/components/map-store-list";
import { RecentSearches } from "@/features/explore/components/recent-searches";
import { StoreDetailDrawer } from "@/features/explore/components/store-detail-drawer";
import { useCandidateTray } from "@/features/explore/hooks/use-candidate-tray";
import { useExploreUrlState } from "@/features/explore/hooks/use-explore-url-state";
import { useRecentSearches } from "@/features/explore/hooks/use-recent-searches";
import {
  createCandidateRegion,
  createCandidateStore,
} from "@/features/explore/lib/candidate-storage";
import { serializeExploreQuery } from "@/features/explore/lib/explore-url-params";
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
  const { query, setQuery } = useExploreUrlState();
  const initialCenter = useMemo(
    () => ({
      lat: query.lat ?? DEFAULT_CENTER.lat,
      lng: query.lng ?? DEFAULT_CENTER.lng,
    }),
    [query.lat, query.lng],
  );
  const [center, setCenter] = useState<MapCenter>(initialCenter);
  const [draftViewport, setDraftViewport] = useState<MapBounds | null>(null);
  const [appliedViewport, setAppliedViewport] = useState<MapBounds | null>(null);
  const [selectedStore, setSelectedStore] = useState<
    StoreMapItem | StoreNearbyItem | null
  >(null);
  const [nearbyParams, setNearbyParams] =
    useState<NearbyStoreSearchParams | null>(null);
  const hasCreatedInitialViewport = useRef(false);
  const candidateTray = useCandidateTray();
  const recentSearches = useRecentSearches();

  const categoriesQuery = useQuery({
    queryKey: storeQueryKeys.categories(),
    queryFn: getStoreCategories,
  });
  const regionsQuery = useQuery({
    queryKey: storeQueryKeys.regions(),
    queryFn: getRegions,
  });
  const selectedSido = regionsQuery.data?.find(
    (region) => region.sidoCode === query.ctprvnCd,
  );
  const selectedSigungu = selectedSido?.sigunguList.find(
    (option) => option.sigunguCode === query.signguCd,
  );
  const selectedDong = selectedSigungu?.dongList.find(
    (option) => option.dongCode === query.adongCd,
  );
  const selectedLargeCategory = categoriesQuery.data?.find(
    (category) => category.largeCode === query.indsLclsCd,
  );
  const selectedMediumCategory = selectedLargeCategory?.mediumCategories.find(
    (category) => category.mediumCode === query.indsMclsCd,
  );
  const mapParams = useMemo<MapStoreSearchParams>(
    () => ({
      sido: normalizeSelectValue(selectedSido?.sidoName ?? query.ctprvnNm),
      sigungu: normalizeSelectValue(selectedSigungu?.sigunguName ?? query.signguNm),
      dong: normalizeSelectValue(selectedDong?.dongName ?? query.adongNm),
      categoryLargeCode: normalizeSelectValue(query.indsLclsCd),
      categoryMediumCode: normalizeSelectValue(query.indsMclsCd),
      categorySmallCode: normalizeSelectValue(query.indsSclsCd),
      minLat: appliedViewport?.minLat,
      maxLat: appliedViewport?.maxLat,
      minLng: appliedViewport?.minLng,
      maxLng: appliedViewport?.maxLng,
      limit: MAP_LIMIT,
    }),
    [
      appliedViewport,
      query.adongNm,
      query.ctprvnNm,
      query.indsLclsCd,
      query.indsMclsCd,
      query.indsSclsCd,
      query.signguNm,
      selectedDong,
      selectedSido,
      selectedSigungu,
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
  const hasPendingViewport =
    draftViewport !== null && !isSameViewport(appliedViewport, draftViewport);

  useEffect(() => {
    if (query.lat === undefined || query.lng === undefined) {
      return;
    }
    const nextCenter = { lat: query.lat, lng: query.lng };
    const timer = window.setTimeout(() => {
      setCenter((currentCenter) =>
        isSameCenter(currentCenter, nextCenter) ? currentCenter : nextCenter,
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [query.lat, query.lng]);

  function resetNearbyState() {
    setNearbyParams(null);
    setSelectedStore(null);
  }

  function updateSido(value: string) {
    const option = regionsQuery.data?.find((region) => region.sidoCode === value);
    setQuery({
      ctprvnCd: value,
      ctprvnNm: option?.sidoName ?? "",
      signguCd: "all",
      signguNm: "",
      adongCd: "all",
      adongNm: "",
      page: 0,
    });
    resetNearbyState();
  }

  function updateSigungu(value: string) {
    const option = selectedSido?.sigunguList.find((sigungu) => sigungu.sigunguCode === value);
    setQuery({
      signguCd: value,
      signguNm: option?.sigunguName ?? "",
      adongCd: "all",
      adongNm: "",
      page: 0,
    });
    resetNearbyState();
  }

  function updateDong(value: string) {
    const option = selectedSigungu?.dongList.find((dong) => dong.dongCode === value);
    setQuery({
      adongCd: value,
      adongNm: option?.dongName ?? "",
      page: 0,
    });
    resetNearbyState();
  }

  function updateLargeCategory(value: string) {
    const option = categoriesQuery.data?.find((category) => category.largeCode === value);
    setQuery({
      indsLclsCd: value,
      indsLclsNm: option?.largeName ?? "",
      indsMclsCd: "all",
      indsMclsNm: "",
      indsSclsCd: "all",
      indsSclsNm: "",
      page: 0,
    });
    resetNearbyState();
  }

  function updateMediumCategory(value: string) {
    const option = selectedLargeCategory?.mediumCategories.find(
      (category) => category.mediumCode === value,
    );
    setQuery({
      indsMclsCd: value,
      indsMclsNm: option?.mediumName ?? "",
      indsSclsCd: "all",
      indsSclsNm: "",
      page: 0,
    });
    resetNearbyState();
  }

  function updateSmallCategory(value: string) {
    const option = selectedMediumCategory?.smallCategories.find(
      (category) => category.smallCode === value,
    );
    setQuery({
      indsSclsCd: value,
      indsSclsNm: option?.smallName ?? "",
      page: 0,
    });
    resetNearbyState();
  }

  function handleMapAreaSearch() {
    if (!draftViewport) {
      return;
    }
    addSafeBreadcrumb("map.viewport-search", "현재 지도 영역에서 검색", {
      hasRegion: query.signguCd !== "all",
      hasCategory: query.indsLclsCd !== "all",
    });
    setAppliedViewport(draftViewport);
    setQuery(
      {
        lat: center.lat,
        lng: center.lng,
        radius: query.radius,
      },
      { replace: true },
    );
    recentSearches.saveSearch({
      label: "지도 영역 검색",
      path: "/map",
      query: serializeExploreQuery({
        ...query,
        lat: center.lat,
        lng: center.lng,
      }).toString(),
    });
  }

  function handleNearbySearch() {
    addSafeBreadcrumb("map.nearby-search", "지도 반경 검색 실행", {
      radius: query.radius,
      hasCategory: query.indsLclsCd !== "all",
    });
    const nextParams = {
      lat: center.lat,
      lng: center.lng,
      radius: query.radius,
      categoryLargeCode: normalizeSelectValue(query.indsLclsCd),
      categoryMediumCode: normalizeSelectValue(query.indsMclsCd),
      categorySmallCode: normalizeSelectValue(query.indsSclsCd),
      limit: NEARBY_LIMIT,
    };
    setNearbyParams(nextParams);
    setQuery(
      {
        lat: center.lat,
        lng: center.lng,
        radius: query.radius,
      },
      { replace: true },
    );
    recentSearches.saveSearch({
      label: `반경 ${query.radius.toLocaleString("ko-KR")}m 검색`,
      path: "/map",
      query: serializeExploreQuery({
        ...query,
        lat: center.lat,
        lng: center.lng,
      }).toString(),
    });
  }

  const handleSelectStore = useCallback(
    (store: StoreMapItem | StoreNearbyItem, source: "marker" | "list" = "list") => {
      addSafeBreadcrumb(
        source === "marker" ? "map.marker-click" : "map.list-item-click",
        source === "marker" ? "지도 marker 클릭" : "지도 목록 item 클릭",
        {
          storeId: store.id,
          categoryLargeCode: store.categoryLargeCode,
        },
      );
      setSelectedStore(store);
      const nextCenter = { lat: store.latitude, lng: store.longitude };
      setCenter(nextCenter);
      setQuery(
        {
          lat: nextCenter.lat,
          lng: nextCenter.lng,
        },
        { replace: true },
      );
    },
    [setQuery],
  );

  const handleMapReady = useCallback((map: kakao.maps.Map) => {
    const nextCenter = readCenter(map);
    const nextViewport = readBounds(map);
    setCenter((currentCenter) =>
      isSameCenter(currentCenter, nextCenter) ? currentCenter : nextCenter,
    );
    setDraftViewport(nextViewport);
    if (!hasCreatedInitialViewport.current) {
      setAppliedViewport(nextViewport);
      hasCreatedInitialViewport.current = true;
    }
  }, []);

  function addRegionCandidate() {
    const candidate = createCandidateRegion({
      ctprvnCd: query.ctprvnCd,
      ctprvnNm: selectedSido?.sidoName ?? query.ctprvnNm,
      signguCd: query.signguCd,
      signguNm: selectedSigungu?.sigunguName ?? query.signguNm,
      adongCd: query.adongCd,
      adongNm: selectedDong?.dongName ?? query.adongNm,
      source: "MAP",
    });
    if (candidate) {
      candidateTray.addCandidate(candidate);
    }
  }

  function addStoreCandidate(store: StoreMapItem | StoreNearbyItem) {
    candidateTray.addCandidate(
      createCandidateStore({
        storeId: store.id,
        storeName: store.storeName,
        categoryName: store.categorySmallName,
        ctprvnCd: query.ctprvnCd === "all" ? undefined : query.ctprvnCd,
        ctprvnNm: selectedSido?.sidoName ?? store.sido,
        signguCd: query.signguCd === "all" ? undefined : query.signguCd,
        signguNm: selectedSigungu?.sigunguName ?? store.sigungu,
        adongCd: query.adongCd === "all" ? undefined : query.adongCd,
        adongNm: selectedDong?.dongName ?? store.dong,
        latitude: store.latitude,
        longitude: store.longitude,
      }),
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <MapFilterPanel
          sido={query.ctprvnCd}
          sigungu={query.signguCd}
          dong={query.adongCd}
          categoryLargeCode={query.indsLclsCd}
          categoryMediumCode={query.indsMclsCd}
          categorySmallCode={query.indsSclsCd}
          radius={query.radius}
          regions={regionsQuery.data ?? []}
          categories={categoriesQuery.data ?? []}
          isLoading={isFilterLoading}
          markerCount={mapStoresQuery.data?.length ?? 0}
          isNearbyLoading={nearbyStoresQuery.isFetching}
          onSidoChange={updateSido}
          onSigunguChange={updateSigungu}
          onDongChange={updateDong}
          onCategoryLargeChange={updateLargeCategory}
          onCategoryMediumChange={updateMediumCategory}
          onCategorySmallChange={updateSmallCategory}
          onRadiusChange={(value) => setQuery({ radius: value })}
          onNearbySearch={handleNearbySearch}
        />

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addRegionCandidate}
          disabled={query.signguCd === "all" && !query.signguNm}
        >
          <BookmarkPlus className="size-4" aria-hidden="true" />
          현재 지역 후보 추가
        </Button>

        <StoreDetailDrawer
          store={selectedStore}
          distanceMeters={
            selectedStore && "distanceMeters" in selectedStore
              ? selectedStore.distanceMeters
              : undefined
          }
          onAddCandidate={addStoreCandidate}
        />

        <CandidateTray
          candidates={candidateTray.candidates}
          isReady={candidateTray.isReady}
          onRemove={candidateTray.removeCandidate}
          onClear={candidateTray.clearCandidates}
        />

        <RecentSearches
          searches={recentSearches.searches}
          onClear={recentSearches.clearSearches}
        />
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
            hasPendingViewport={hasPendingViewport}
            onMapReady={handleMapReady}
            onSelectStore={(store) => handleSelectStore(store, "marker")}
            onViewportSearch={handleMapAreaSearch}
            onRetry={() => mapStoresQuery.refetch()}
          />
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <MapStoreList
            stores={mapStoresQuery.data ?? []}
            selectedStoreId={selectedStore?.id}
            isLoading={mapStoresQuery.isLoading}
            isError={mapStoresQuery.isError}
            onSelectStore={(store) => handleSelectStore(store, "list")}
            onAddCandidate={addStoreCandidate}
            onRetry={() => mapStoresQuery.refetch()}
          />
          <NearbySearchPanel
            center={center}
            radius={query.radius}
            stores={nearbyStores}
            selectedStoreId={selectedStore?.id}
            isLoading={nearbyStoresQuery.isFetching}
            isError={nearbyStoresQuery.isError}
            hasSearched={nearbyParams !== null}
            onRetry={() => nearbyStoresQuery.refetch()}
            onSelectStore={(store) => handleSelectStore(store, "list")}
            onAddCandidate={addStoreCandidate}
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
  hasPendingViewport: boolean;
  onMapReady: (map: kakao.maps.Map) => void;
  onSelectStore: (store: StoreMapItem) => void;
  onViewportSearch: () => void;
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
  hasPendingViewport,
  onMapReady,
  onSelectStore,
  onViewportSearch,
  onRetry,
}: KakaoStoreMapProps) {
  const [isMapLoading, mapLoadError] = useKakaoLoader({
    appkey: appKey,
  });

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
        onCreate={onMapReady}
        onIdle={onMapReady}
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

      {hasPendingViewport ? (
        <div className="absolute inset-x-4 top-16 flex justify-center">
          <Button
            type="button"
            className="bg-teal-700 text-white shadow-lg hover:bg-teal-800"
            onClick={onViewportSearch}
          >
            <Search className="size-4" aria-hidden="true" />
            현재 지도 영역에서 검색
          </Button>
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

function normalizeSelectValue(value?: string) {
  return value && value !== "all" ? value : undefined;
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
