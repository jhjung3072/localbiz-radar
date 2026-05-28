"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getRegions,
  getStoreCategories,
  getStores,
} from "@/features/stores/api/store-api";
import { storeQueryKeys } from "@/features/stores/api/store-query-keys";
import type { StoreListItem, StoreSearchParams } from "@/features/stores/types";

const columns: ColumnDef<StoreListItem>[] = [
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

export function StoreTable() {
  const [keyword, setKeyword] = useState("");
  const [sido, setSido] = useState("all");
  const [sigungu, setSigungu] = useState("all");
  const [dong, setDong] = useState("all");
  const [categoryLargeCode, setCategoryLargeCode] = useState("all");
  const [categoryMediumCode, setCategoryMediumCode] = useState("all");
  const [categorySmallCode, setCategorySmallCode] = useState("all");
  const [page, setPage] = useState(0);
  const [size] = useState(10);

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
  const sigunguOptions = selectedSido?.sigunguList ?? [];
  const selectedSigungu = sigunguOptions.find(
    (sigunguOption) => sigunguOption.sigunguCode === sigungu,
  );
  const dongOptions = selectedSigungu?.dongList ?? [];
  const selectedDong = dongOptions.find((option) => option.dongCode === dong);

  const storeParams = useMemo<StoreSearchParams>(
    () => ({
      keyword: keyword.trim(),
      sido: selectedSido?.sidoName ?? "all",
      sigungu: selectedSigungu?.sigunguName ?? "all",
      dong: selectedDong?.dongName ?? "all",
      categoryLargeCode,
      categoryMediumCode,
      categorySmallCode,
      page,
      size,
    }),
    [
      categoryLargeCode,
      categoryMediumCode,
      categorySmallCode,
      keyword,
      page,
      selectedDong,
      selectedSido,
      selectedSigungu,
      size,
    ],
  );

  const storesQuery = useQuery({
    queryKey: storeQueryKeys.list(storeParams),
    queryFn: () => getStores(storeParams),
  });

  const selectedLargeCategory = categoriesQuery.data?.find(
    (category) => category.largeCode === categoryLargeCode,
  );
  const mediumCategoryOptions = selectedLargeCategory?.mediumCategories ?? [];
  const selectedMediumCategory = mediumCategoryOptions.find(
    (category) => category.mediumCode === categoryMediumCode,
  );
  const smallCategoryOptions = selectedMediumCategory?.smallCategories ?? [];

  const stores = storesQuery.data?.content ?? [];
  const totalElements = storesQuery.data?.totalElements ?? 0;
  const totalPages = storesQuery.data?.totalPages ?? 0;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: stores,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const visibleStart = totalElements > 0 ? page * size + 1 : 0;
  const visibleEnd = Math.min((page + 1) * size, totalElements);
  const isFilterLoading = categoriesQuery.isLoading || regionsQuery.isLoading;

  function resetToFirstPage() {
    setPage(0);
  }

  return (
    <section aria-label="점포 목록 테이블" className="space-y-5">
      <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(6,minmax(0,1fr))]">
          <div>
            <label
              htmlFor="store-keyword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              키워드로 점포 검색
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="store-keyword"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  resetToFirstPage();
                }}
                placeholder="상호명, 업종, 주소 검색"
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="store-sido"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              시도
            </label>
            <select
              id="store-sido"
              value={sido}
              onChange={(event) => {
                setSido(event.target.value);
                setSigungu("all");
                setDong("all");
                resetToFirstPage();
              }}
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
              value={sigungu}
              onChange={(event) => {
                setSigungu(event.target.value);
                setDong("all");
                resetToFirstPage();
              }}
              disabled={sido === "all" || isFilterLoading}
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
              value={dong}
              onChange={(event) => {
                setDong(event.target.value);
                resetToFirstPage();
              }}
              disabled={sigungu === "all" || isFilterLoading}
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
              value={categoryLargeCode}
              onChange={(event) => {
                setCategoryLargeCode(event.target.value);
                setCategoryMediumCode("all");
                setCategorySmallCode("all");
                resetToFirstPage();
              }}
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
              value={categoryMediumCode}
              onChange={(event) => {
                setCategoryMediumCode(event.target.value);
                setCategorySmallCode("all");
                resetToFirstPage();
              }}
              disabled={categoryLargeCode === "all" || isFilterLoading}
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
              value={categorySmallCode}
              onChange={(event) => {
                setCategorySmallCode(event.target.value);
                resetToFirstPage();
              }}
              disabled={categoryMediumCode === "all" || isFilterLoading}
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
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          검색 조건을 변경하면 첫 페이지부터 다시 조회합니다.
        </div>
      </div>

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
          <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              검색 조건에 맞는 점포 목록과 주소 정보를 표시합니다.
            </caption>
            <thead className="bg-slate-50 text-slate-600">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="border-b border-slate-200 px-4 py-3 font-semibold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {storesQuery.isLoading ? (
                <LoadingRows />
              ) : storesQuery.isError ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-rose-700"
                  >
                    데이터를 불러오지 못했습니다.
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-slate-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    조건에 맞는 점포가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              disabled={page === 0 || storesQuery.isFetching}
              onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              이전
            </Button>
            <span className="rounded-md bg-slate-100 px-3 py-1 font-medium text-slate-700">
              {totalPages === 0 ? 0 : page + 1} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages || storesQuery.isFetching}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              다음
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {columns.map((column, columnIndex) => (
            <td key={`${String(column.id ?? columnIndex)}-${rowIndex}`} className="px-4 py-3">
              <div className="h-4 w-full max-w-32 animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
