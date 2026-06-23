"use client";

import type { RefObject } from "react";
import type { MockStore } from "@/features/performance/types";

type LegacyStoreListProps = {
  stores: MockStore[];
  itemHeight: number;
  listRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  onSelect: (store: MockStore) => void;
};

export function LegacyStoreList({
  stores,
  itemHeight,
  listRef,
  viewportRef,
  onSelect,
}: LegacyStoreListProps) {
  return (
    <div
      ref={viewportRef}
      className="h-[560px] overflow-auto rounded-[8px] border border-slate-200 bg-white"
      data-perf-list-viewport
    >
      <div ref={listRef} className="divide-y divide-slate-100" data-perf-list>
        {stores.map((store) => (
          <button
            key={store.id}
            type="button"
            className="grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_7rem] items-center gap-3 px-4 text-left text-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/30"
            style={{ minHeight: itemHeight }}
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
            <span className="justify-self-end rounded-[8px] bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              #{store.id}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
