"use client";

import Link from "next/link";
import { Clock, X } from "lucide-react";
import type { RecentExploreSearch } from "@/features/explore/types";

type RecentSearchesProps = {
  searches: RecentExploreSearch[];
  onClear?: () => void;
};

export function RecentSearches({ searches, onClear }: RecentSearchesProps) {
  if (searches.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="최근 탐색 조건"
      className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <Clock className="size-4 text-teal-700" aria-hidden="true" />
          최근 탐색 조건
        </h2>
        {onClear ? (
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-slate-300"
            onClick={onClear}
            aria-label="최근 탐색 조건 비우기"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <ul className="mt-3 space-y-2">
        {searches.map((search) => (
          <li key={`${search.path}?${search.query}`}>
            <Link
              href={`${search.path}${search.query ? `?${search.query}` : ""}`}
              className="block rounded-md border border-slate-200 px-3 py-2 text-sm transition hover:border-teal-200 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/30"
            >
              <span className="block font-medium text-slate-800">{search.label}</span>
              <span className="mt-1 block text-xs text-slate-500">
                {search.path} · {new Date(search.createdAt).toLocaleString("ko-KR")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
