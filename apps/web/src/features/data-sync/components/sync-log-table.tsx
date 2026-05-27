"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  SyncLogListItem,
  SyncLogPage,
} from "@/features/data-sync/types";
import {
  statusLabel,
  statusToneClassName,
} from "@/features/data-sync/components/sync-status";

type SyncLogTableProps = {
  data?: SyncLogPage;
  isLoading: boolean;
  isError: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

const columns: ColumnDef<SyncLogListItem>[] = [
  {
    accessorKey: "status",
    header: "상태",
    cell: ({ row }) => (
      <span
        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusToneClassName(
          row.original.status,
        )}`}
      >
        {statusLabel(row.original.status)}
      </span>
    ),
  },
  {
    accessorKey: "syncType",
    header: "동기화 유형",
    cell: ({ row }) => syncTypeLabel(row.original.syncType),
  },
  { accessorKey: "sourceName", header: "sourceName" },
  {
    accessorKey: "dryRun",
    header: "dryRun",
    cell: ({ row }) => (row.original.dryRun ? "검증만" : "실제 반영"),
  },
  {
    accessorKey: "totalRows",
    header: "총 row",
    cell: ({ row }) => row.original.totalRows.toLocaleString("ko-KR"),
  },
  {
    accessorKey: "successRows",
    header: "성공 row",
    cell: ({ row }) => row.original.successRows.toLocaleString("ko-KR"),
  },
  {
    accessorKey: "failedRows",
    header: "실패 row",
    cell: ({ row }) => row.original.failedRows.toLocaleString("ko-KR"),
  },
  {
    accessorKey: "startedAt",
    header: "startedAt",
    cell: ({ row }) => formatDateTime(row.original.startedAt),
  },
  {
    accessorKey: "finishedAt",
    header: "finishedAt",
    cell: ({ row }) => formatDateTime(row.original.finishedAt),
  },
];

export function SyncLogTable({
  data,
  isLoading,
  isError,
  page,
  onPageChange,
  onRetry,
}: SyncLogTableProps) {
  const logs = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section
      aria-label="동기화 이력"
      className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">동기화 이력</h2>
          <p className="mt-1 text-sm text-slate-500">
            최근 CSV import와 OpenAPI 동기화 처리 결과를 확인합니다.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="size-4" aria-hidden="true" />
          새로고침
        </Button>
      </div>

      {isError ? (
        <div role="alert" className="m-4 rounded-md bg-rose-50 p-4 text-sm text-rose-800">
          동기화 이력을 불러오지 못했습니다.
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
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
            {isLoading ? (
              <LoadingRows />
            ) : logs.length > 0 ? (
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
                  동기화 이력이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>총 {totalElements.toLocaleString("ko-KR")}개 이력</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0 || isLoading}
            onClick={() => onPageChange(Math.max(page - 1, 0))}
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
            disabled={page + 1 >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            다음
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
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
              <div className="h-4 w-full max-w-28 animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function syncTypeLabel(syncType: string) {
  if (syncType === "STORE_CSV_IMPORT") {
    return "상가정보 CSV";
  }
  if (syncType === "STORE_OPENAPI_SYNC") {
    return "상가정보 OpenAPI";
  }
  return syncType;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
