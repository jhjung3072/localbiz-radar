import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  type ColumnDef,
  flexRender,
  type Row,
  type Table as ReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { StoreListItem } from "@/features/stores/types";

type VirtualizedStoreListProps = {
  table: ReactTable<StoreListItem>;
  columns: ColumnDef<StoreListItem>[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function VirtualizedStoreList({
  table,
  columns,
  isLoading,
  isError,
  onRetry,
}: VirtualizedStoreListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  return (
    <div
      ref={parentRef}
      tabIndex={0}
      role="region"
      aria-label="점포 목록 스크롤 영역"
      className="max-h-[560px] overflow-auto focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/30"
    >
      <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          점포 목록. 검색 조건에 맞는 점포 목록과 주소 정보를 표시합니다. 대량 결과에서는 보이는 행만 렌더링합니다.
        </caption>
        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
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
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? <LoadingRows columnCount={columns.length} /> : null}

          {isError ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-rose-700"
              >
                <p>데이터를 불러오지 못했습니다.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onRetry}
                >
                  다시 시도
                </Button>
              </td>
            </tr>
          ) : null}

          {!isLoading && !isError && rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-slate-500"
              >
                조건에 맞는 점포가 없습니다.
              </td>
            </tr>
          ) : null}

          {!isLoading && !isError && paddingTop > 0 ? (
            <tr aria-hidden="true">
              <td colSpan={columns.length} style={{ height: paddingTop }} />
            </tr>
          ) : null}

          {!isLoading && !isError
            ? virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                if (!row) {
                  return null;
                }

                return <StoreTableRow key={row.id} row={row} />;
              })
            : null}

          {!isLoading && !isError && paddingBottom > 0 ? (
            <tr aria-hidden="true">
              <td colSpan={columns.length} style={{ height: paddingBottom }} />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function StoreTableRow({ row }: { row: Row<StoreListItem> }) {
  return (
    <tr className="hover:bg-slate-50">
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className="px-4 py-3 text-slate-700">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

function LoadingRows({ columnCount }: { columnCount: number }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columnCount }).map((_, columnIndex) => (
            <td key={`${columnIndex}-${rowIndex}`} className="px-4 py-3">
              <div className="h-4 w-full max-w-32 animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
