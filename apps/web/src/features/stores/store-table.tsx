"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockStores, type StoreRecord } from "@/features/stores/mock-stores";

const columns: ColumnDef<StoreRecord>[] = [
  { accessorKey: "storeName", header: "상호명" },
  { accessorKey: "categoryLargeName", header: "대분류" },
  { accessorKey: "categoryMediumName", header: "중분류" },
  { accessorKey: "categorySmallName", header: "소분류" },
  { accessorKey: "sido", header: "시도" },
  { accessorKey: "sigungu", header: "시군구" },
  { accessorKey: "dong", header: "동" },
  { accessorKey: "address", header: "주소" },
];

export function StoreTable() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");

  const categoryOptions = useMemo(
    () => Array.from(new Set(mockStores.map((store) => store.categoryLargeName))),
    [],
  );
  const regionOptions = useMemo(
    () => Array.from(new Set(mockStores.map((store) => store.sido))),
    [],
  );

  const filteredStores = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return mockStores.filter((store) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        [
          store.storeName,
          store.categoryLargeName,
          store.categoryMediumName,
          store.categorySmallName,
          store.sido,
          store.sigungu,
          store.dong,
          store.address,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);
      const matchesCategory =
        category === "all" || store.categoryLargeName === category;
      const matchesRegion = region === "all" || store.sido === region;

      return matchesKeyword && matchesCategory && matchesRegion;
    });
  }, [category, keyword, region]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredStores,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const visibleStart = filteredStores.length > 0 ? 1 : 0;
  const visibleEnd = filteredStores.length;

  return (
    <section aria-label="상가 목록 테이블" className="space-y-5">
      <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div>
            <label
              htmlFor="store-keyword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              키워드 검색
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="store-keyword"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="상호명, 업종, 주소 검색"
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="store-category"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              업종
            </label>
            <select
              id="store-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 w-full min-w-36 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
            >
              <option value="all">전체 업종</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="store-region"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              지역
            </label>
            <select
              id="store-region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="h-10 w-full min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
            >
              <option value="all">전체 지역</option>
              {regionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          필터는 현재 목업 데이터에만 적용됩니다.
        </div>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
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
              {table.getRowModel().rows.length > 0 ? (
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
                    조건에 맞는 목업 상가가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            총 {filteredStores.length.toLocaleString("ko-KR")}개 중{" "}
            {visibleStart.toLocaleString("ko-KR")}-
            {visibleEnd.toLocaleString("ko-KR")} 표시
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled>
              <ChevronLeft className="size-4" aria-hidden="true" />
              이전
            </Button>
            <span className="rounded-md bg-slate-100 px-3 py-1 font-medium text-slate-700">
              1
            </span>
            <Button type="button" variant="outline" size="sm" disabled>
              다음
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
