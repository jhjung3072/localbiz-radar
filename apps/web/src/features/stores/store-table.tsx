"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Save,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveFilterChips } from "@/features/explore/components/active-filter-chips";
import { CandidateTray } from "@/features/explore/components/candidate-tray";
import { DebouncedSearchInput } from "@/features/explore/components/debounced-search-input";
import { PerformanceNotice } from "@/features/explore/components/performance-notice";
import { RecentSearches } from "@/features/explore/components/recent-searches";
import { ViewOnMapLink } from "@/features/explore/components/view-on-map-link";
import { useCandidateTray } from "@/features/explore/hooks/use-candidate-tray";
import { useExploreUrlState } from "@/features/explore/hooks/use-explore-url-state";
import { useRecentSearches } from "@/features/explore/hooks/use-recent-searches";
import {
  clearCategoryQuery,
  clearRegionQuery,
  serializeExploreQuery,
} from "@/features/explore/lib/explore-url-params";
import {
  createCandidateRegion,
  createCandidateStore,
} from "@/features/explore/lib/candidate-storage";
import {
  getRegions,
  getStoreCategories,
  getStores,
} from "@/features/stores/api/store-api";
import {
  normalizeStoreSearchParams,
  storeQueryKeys,
} from "@/features/stores/api/store-query-keys";
import { VirtualizedStoreList } from "@/features/stores/components/virtualized-store-list";
import type { StoresBffData } from "@/features/bff/server/types";
import type { StoreListItem, StoreSearchParams } from "@/features/stores/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { addSafeBreadcrumb } from "@/lib/sentry-utils";

const baseColumns: ColumnDef<StoreListItem>[] = [
  { accessorKey: "storeName", header: "상호명" },
  { accessorKey: "categoryLargeName", header: "대분류" },
  { accessorKey: "categoryMediumName", header: "중분류" },
  { accessorKey: "categorySmallName", header: "소분류" },
  { accessorKey: "sido", header: "시도" },
  { accessorKey: "sigungu", header: "시군구" },
  { accessorKey: "dong", header: "동" },
  {
    accessorKey: "roadAddress",
    header: "주소",
    cell: ({ row }) => row.original.roadAddress ?? "-",
  },
];

type StoreTableProps = {
  initialData?: StoresBffData | null;
};

export function StoreTable({ initialData }: StoreTableProps) {
  const { query, setQuery, replaceQuery, pathname } = useExploreUrlState();
  const [keywordInput, setKeywordInput] = useState(query.keyword);
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const lastSubmittedKeywordRef = useRef(query.keyword);
  const debouncedKeywordInput = useDebouncedValue(keywordInput, 450);
  const candidateTray = useCandidateTray();
  const recentSearches = useRecentSearches();

  const categoriesQuery = useQuery({
    queryKey: storeQueryKeys.categories(),
    queryFn: getStoreCategories,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
    initialData: initialData?.filters.categories,
  });
  const regionsQuery = useQuery({
    queryKey: storeQueryKeys.regions(),
    queryFn: getRegions,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
    initialData: initialData?.filters.regions,
  });
  const selectedSido = regionsQuery.data?.find(
    (region) => region.sidoCode === query.ctprvnCd,
  );
  const sigunguOptions = selectedSido?.sigunguList ?? [];
  const selectedSigungu = sigunguOptions.find(
    (sigunguOption) => sigunguOption.sigunguCode === query.signguCd,
  );
  const dongOptions = selectedSigungu?.dongList ?? [];
  const selectedDong = dongOptions.find((option) => option.dongCode === query.adongCd);

  const storeParams = useMemo<StoreSearchParams>(
    () => ({
      keyword: query.keyword.trim(),
      sido: selectedSido?.sidoName ?? query.ctprvnNm ?? "all",
      sigungu: selectedSigungu?.sigunguName ?? query.signguNm ?? "all",
      dong: selectedDong?.dongName ?? query.adongNm ?? "all",
      categoryLargeCode: query.indsLclsCd,
      categoryMediumCode: query.indsMclsCd,
      categorySmallCode: query.indsSclsCd,
      page: query.page,
      size: query.size,
    }),
    [
      query.adongNm,
      query.ctprvnNm,
      query.indsLclsCd,
      query.indsMclsCd,
      query.indsSclsCd,
      query.keyword,
      query.page,
      query.signguNm,
      query.size,
      selectedDong,
      selectedSido,
      selectedSigungu,
    ],
  );

  const normalizedStoreParams = useMemo(
    () => normalizeStoreSearchParams(storeParams),
    [storeParams],
  );
  const initialStoresData = useMemo(() => {
    if (!initialData) {
      return undefined;
    }

    return JSON.stringify(normalizedStoreParams) ===
      JSON.stringify(normalizeStoreSearchParams(initialData.requestParams))
      ? initialData.stores
      : undefined;
  }, [initialData, normalizedStoreParams]);
  const storesQuery = useQuery({
    queryKey: storeQueryKeys.list(normalizedStoreParams),
    queryFn: () => getStores(normalizedStoreParams),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    initialData: initialStoresData,
  });

  const selectedLargeCategory = categoriesQuery.data?.find(
    (category) => category.largeCode === query.indsLclsCd,
  );
  const mediumCategoryOptions = selectedLargeCategory?.mediumCategories ?? [];
  const selectedMediumCategory = mediumCategoryOptions.find(
    (category) => category.mediumCode === query.indsMclsCd,
  );
  const smallCategoryOptions = selectedMediumCategory?.smallCategories ?? [];

  const stores = storesQuery.data?.content ?? [];
  const totalElements = storesQuery.data?.totalElements ?? 0;
  const totalPages = storesQuery.data?.totalPages ?? 0;
  const columns = useMemo<ColumnDef<StoreListItem>[]>(
    () => [
      ...baseColumns,
      {
        id: "actions",
        header: "후보",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addStoreCandidate(row.original)}
          >
            <BookmarkPlus className="size-4" aria-hidden="true" />
            추가
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: stores,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const visibleStart = totalElements > 0 ? query.page * query.size + 1 : 0;
  const visibleEnd = Math.min((query.page + 1) * query.size, totalElements);
  const isFilterLoading = categoriesQuery.isLoading || regionsQuery.isLoading;
  const currentQueryString = serializeExploreQuery(query).toString();

  useEffect(() => {
    setKeywordInput(query.keyword);
    lastSubmittedKeywordRef.current = query.keyword;
  }, [query.keyword]);

  useEffect(() => {
    const nextKeyword = debouncedKeywordInput.trim();
    if (
      nextKeyword === query.keyword ||
      nextKeyword === lastSubmittedKeywordRef.current
    ) {
      return;
    }

    lastSubmittedKeywordRef.current = nextKeyword;
    addSafeBreadcrumb("stores.debounced-search", "점포 검색 debounce 반영", {
      hasKeyword: nextKeyword.length > 0,
      keywordLength: nextKeyword.length,
    });
    setQuery({ keyword: nextKeyword, page: 0 }, { replace: true });
  }, [debouncedKeywordInput, query.keyword, setQuery]);

  useEffect(() => {
    addSafeBreadcrumb("stores.search", "점포 목록 조회 조건 변경", {
      hasKeyword: query.keyword.trim().length > 0,
      keywordLength: query.keyword.trim().length,
      hasRegionFilter:
        query.ctprvnCd !== "all" ||
        query.signguCd !== "all" ||
        query.adongCd !== "all",
      hasCategoryFilter:
        query.indsLclsCd !== "all" ||
        query.indsMclsCd !== "all" ||
        query.indsSclsCd !== "all",
      page: query.page,
    });
  }, [
    query.adongCd,
    query.ctprvnCd,
    query.indsLclsCd,
    query.indsMclsCd,
    query.indsSclsCd,
    query.keyword,
    query.page,
    query.signguCd,
  ]);

  function submitKeywordSearch() {
    const nextKeyword = keywordInputRef.current?.value.trim() ?? keywordInput.trim();
    addSafeBreadcrumb("stores.search-submit", "점포 검색 실행", {
      hasKeyword: nextKeyword.length > 0,
      keywordLength: nextKeyword.length,
    });
    lastSubmittedKeywordRef.current = nextKeyword;
    setKeywordInput(nextKeyword);
    setQuery({ keyword: nextKeyword, page: 0 });
    recentSearches.saveSearch({
      label: buildRecentSearchLabel("점포 목록", nextKeyword),
      path: "/stores",
      query: serializeExploreQuery({ ...query, keyword: nextKeyword, page: 0 }).toString(),
    });
  }

  function updateSido(value: string) {
    const option = regionsQuery.data?.find((region) => region.sidoCode === value);
    setQuery({
      keyword: keywordInput.trim(),
      ctprvnCd: value,
      ctprvnNm: option?.sidoName ?? "",
      signguCd: "all",
      signguNm: "",
      adongCd: "all",
      adongNm: "",
      page: 0,
    });
  }

  function updateSigungu(value: string) {
    const option = sigunguOptions.find((sigunguOption) => sigunguOption.sigunguCode === value);
    setQuery({
      keyword: keywordInput.trim(),
      signguCd: value,
      signguNm: option?.sigunguName ?? "",
      adongCd: "all",
      adongNm: "",
      page: 0,
    });
  }

  function updateDong(value: string) {
    const option = dongOptions.find((dongOption) => dongOption.dongCode === value);
    setQuery({
      keyword: keywordInput.trim(),
      adongCd: value,
      adongNm: option?.dongName ?? "",
      page: 0,
    });
  }

  function updateLargeCategory(value: string) {
    const option = categoriesQuery.data?.find((category) => category.largeCode === value);
    setQuery({
      keyword: keywordInput.trim(),
      indsLclsCd: value,
      indsLclsNm: option?.largeName ?? "",
      indsMclsCd: "all",
      indsMclsNm: "",
      indsSclsCd: "all",
      indsSclsNm: "",
      page: 0,
    });
  }

  function updateMediumCategory(value: string) {
    const option = mediumCategoryOptions.find((category) => category.mediumCode === value);
    setQuery({
      keyword: keywordInput.trim(),
      indsMclsCd: value,
      indsMclsNm: option?.mediumName ?? "",
      indsSclsCd: "all",
      indsSclsNm: "",
      page: 0,
    });
  }

  function updateSmallCategory(value: string) {
    const option = smallCategoryOptions.find((category) => category.smallCode === value);
    setQuery({
      keyword: keywordInput.trim(),
      indsSclsCd: value,
      indsSclsNm: option?.smallName ?? "",
      page: 0,
    });
  }

  function resetFilters() {
    addSafeBreadcrumb("stores.reset-filters", "점포 필터 초기화");
    replaceQuery({
      ...query,
      keyword: "",
      ctprvnCd: "all",
      ctprvnNm: "",
      signguCd: "all",
      signguNm: "",
      adongCd: "all",
      adongNm: "",
      indsLclsCd: "all",
      indsLclsNm: "",
      indsMclsCd: "all",
      indsMclsNm: "",
      indsSclsCd: "all",
      indsSclsNm: "",
      page: 0,
    });
  }

  function addRegionCandidate() {
    const candidate = createCandidateRegion({
      ctprvnCd: query.ctprvnCd,
      ctprvnNm: selectedSido?.sidoName ?? query.ctprvnNm,
      signguCd: query.signguCd,
      signguNm: selectedSigungu?.sigunguName ?? query.signguNm,
      adongCd: query.adongCd,
      adongNm: selectedDong?.dongName ?? query.adongNm,
      source: "STORES",
    });
    if (candidate) {
      candidateTray.addCandidate(candidate);
    }
  }

  function addStoreCandidate(store: StoreListItem) {
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

  function saveCurrentSearch() {
    recentSearches.saveSearch({
      label: buildRecentSearchLabel("점포 목록", query.keyword),
      path: "/stores",
      query: currentQueryString,
    });
  }

  return (
    <section
      aria-label="점포 목록 테이블"
      className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-5">
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(6,minmax(0,1fr))]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitKeywordSearch();
            }}
          >
            <DebouncedSearchInput
              id="store-keyword"
              label="키워드로 점포 검색"
              value={keywordInput}
              inputRef={keywordInputRef}
              onChange={setKeywordInput}
              placeholder="상호명, 업종, 주소 검색"
              debounceLabel="입력 후 잠시 멈추면 검색 조건이 자동 반영됩니다."
            />
          </form>

          <div>
            <label
              htmlFor="store-sido"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              시도
            </label>
            <select
              id="store-sido"
              value={query.ctprvnCd}
              onChange={(event) => updateSido(event.target.value)}
              disabled={isFilterLoading}
              className="h-10 w-full min-w-36 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
            >
              <option value="all">전체 시도</option>
              {regionsQuery.data?.map((option) => (
                <option key={option.sidoCode} value={option.sidoCode}>
                  {option.sidoName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="store-sigungu"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              시군구
            </label>
            <select
              id="store-sigungu"
              value={query.signguCd}
              onChange={(event) => updateSigungu(event.target.value)}
              disabled={query.ctprvnCd === "all" || isFilterLoading}
              className="h-10 w-full min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
            >
              <option value="all">전체 시군구</option>
              {sigunguOptions.map((option) => (
                <option key={option.sigunguCode} value={option.sigunguCode}>
                  {option.sigunguName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="store-dong"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              행정동
            </label>
            <select
              id="store-dong"
              value={query.adongCd}
              onChange={(event) => updateDong(event.target.value)}
              disabled={query.signguCd === "all" || isFilterLoading}
              className="h-10 w-full min-w-36 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
            >
              <option value="all">전체 동</option>
              {dongOptions.map((option) => (
                <option key={option.dongCode} value={option.dongCode}>
                  {option.dongName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="store-category-large"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              대분류
            </label>
            <select
              id="store-category-large"
              value={query.indsLclsCd}
              onChange={(event) => updateLargeCategory(event.target.value)}
              disabled={isFilterLoading}
              className="h-10 w-full min-w-32 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
            >
              <option value="all">전체 업종</option>
              {categoriesQuery.data?.map((option) => (
                <option key={option.largeCode} value={option.largeCode}>
                  {option.largeName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="store-category-medium"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              중분류
            </label>
            <select
              id="store-category-medium"
              value={query.indsMclsCd}
              onChange={(event) => updateMediumCategory(event.target.value)}
              disabled={query.indsLclsCd === "all" || isFilterLoading}
              className="h-10 w-full min-w-32 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
            >
              <option value="all">전체 중분류</option>
              {mediumCategoryOptions.map((option) => (
                <option key={option.mediumCode} value={option.mediumCode}>
                  {option.mediumName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="store-category-small"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              소분류
            </label>
            <select
              id="store-category-small"
              value={query.indsSclsCd}
              onChange={(event) => updateSmallCategory(event.target.value)}
              disabled={query.indsMclsCd === "all" || isFilterLoading}
              className="h-10 w-full min-w-32 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
            >
              <option value="all">전체 소분류</option>
              {smallCategoryOptions.map((option) => (
                <option key={option.smallCode} value={option.smallCode}>
                  {option.smallName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            검색 조건은 URL에 반영되어 공유할 수 있습니다.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={submitKeywordSearch}>
              <SearchIcon />
              검색
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={addRegionCandidate}
              disabled={query.signguCd === "all" && !query.signguNm}
            >
              <BookmarkPlus className="size-4" aria-hidden="true" />
              현재 지역 후보 추가
            </Button>
            <Button type="button" variant="outline" onClick={saveCurrentSearch}>
              <Save className="size-4" aria-hidden="true" />
              현재 조건 저장
            </Button>
            <ViewOnMapLink
              query={query}
              onClick={() => {
                addSafeBreadcrumb("stores.view-on-map", "지도에서 보기 클릭", {
                  hasKeyword: query.keyword.length > 0,
                  hasRegion: query.signguCd !== "all",
                  hasCategory: query.indsLclsCd !== "all",
                });
              }}
            />
          </div>
        </div>
        <div className="mt-4">
          <ActiveFilterChips
            query={query}
            onClearKeyword={() => setQuery({ keyword: "", page: 0 })}
            onClearRegion={() => replaceQuery(clearRegionQuery(query))}
            onClearCategory={() => replaceQuery(clearCategoryQuery(query))}
            onClearAll={resetFilters}
          />
        </div>
        </div>

      {query.size >= 50 ? (
        <PerformanceNotice message="대량 결과에서도 화면에 보이는 행 중심으로 렌더링합니다. 더 넓은 탐색은 필터를 조정하거나 페이지를 이동해 확인하세요." />
      ) : null}

      {storesQuery.isError ? (
        <div
          role="alert"
          className="rounded-[8px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
        >
          <p className="font-semibold">데이터를 불러오지 못했습니다.</p>
          <p className="mt-2 leading-6">
            API 서버 실행 상태와 네트워크 설정을 확인한 뒤 다시 시도해 주세요.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
            onClick={() => storesQuery.refetch()}
          >
            다시 시도
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-950">검색 결과</h2>
          {storesQuery.isFetching ? (
            <span className="text-sm text-teal-700">조회 중</span>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <VirtualizedStoreList
            table={table}
            columns={columns}
            isLoading={storesQuery.isLoading}
            isError={storesQuery.isError}
            onRetry={() => storesQuery.refetch()}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            총 {totalElements.toLocaleString("ko-KR")}개 중{" "}
            {visibleStart.toLocaleString("ko-KR")}-
            {visibleEnd.toLocaleString("ko-KR")} 표시
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={query.page === 0 || storesQuery.isFetching}
              onClick={() => {
                addSafeBreadcrumb("stores.page-change", "점포 목록 이전 페이지", {
                  page: Math.max(query.page - 1, 0),
                  size: query.size,
                });
                setQuery({ page: Math.max(query.page - 1, 0) });
              }}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              이전
            </Button>
            <span className="rounded-md bg-slate-100 px-3 py-1 font-medium text-slate-700">
              {totalPages === 0 ? 0 : query.page + 1} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={query.page + 1 >= totalPages || storesQuery.isFetching}
              onClick={() => {
                addSafeBreadcrumb("stores.page-change", "점포 목록 다음 페이지", {
                  page: query.page + 1,
                  size: query.size,
                });
                setQuery({ page: query.page + 1 });
              }}
            >
              다음
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        </div>
      </div>
      <aside className="space-y-4">
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
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500 shadow-sm">
          공유 URL:
          <code className="mt-2 block break-all rounded bg-slate-50 p-2 text-xs text-slate-700">
            {pathname}
            {currentQueryString ? `?${currentQueryString}` : ""}
          </code>
        </div>
      </aside>
    </section>
  );
}

function buildRecentSearchLabel(scope: string, keyword: string) {
  return keyword ? `${scope}: ${keyword.slice(0, 24)}` : `${scope}: 전체 조건`;
}

function SearchIcon() {
  return <Search className="size-4" aria-hidden="true" />;
}
