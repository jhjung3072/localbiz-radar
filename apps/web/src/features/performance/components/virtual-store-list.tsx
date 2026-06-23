"use client";

import type { RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { MockStore } from "@/features/performance/types";

type VirtualStoreListProps = {
  stores: MockStore[];
  itemHeight: number;
  listRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  onSelect: (store: MockStore) => void;
};

export function VirtualStoreList({
  stores,
  itemHeight,
  listRef,
  viewportRef,
  onSelect,
}: VirtualStoreListProps) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: stores.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => itemHeight,
    overscan: 8,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={viewportRef}
      className="h-[560px] overflow-auto rounded-[8px] border border-slate-200 bg-white"
      data-perf-list-viewport
    >
      <div
        ref={listRef}
        className="relative w-full"
        style={{ height: rowVirtualizer.getTotalSize() }}
        data-perf-list
      >
        {virtualRows.map((virtualRow) => {
          const store = stores[virtualRow.index];
          if (!store) {
            return null;
          }

          return (
            <button
              key={store.id}
              type="button"
              className="absolute left-0 top-0 grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_7rem] items-center gap-3 border-b border-slate-100 px-4 text-left text-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/30"
              style={{
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              data-perf-row
              data-perf-detail-button
              onClick={() => onSelect(store)}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-950">
                  {store.storeName}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-500">
                  {store.roadAddress}
                </span>
              </span>
              <span className="truncate text-slate-600">{store.categorySmallName}</span>
              <span className="truncate text-slate-600">
                {store.sigunguName} {store.dongName}
              </span>
              <span className="justify-self-end rounded-[8px] bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">
                #{store.id}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
