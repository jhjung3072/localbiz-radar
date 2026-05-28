import { Search } from "lucide-react";
import type { ExploreQueryState } from "@/features/explore/types";

type ExploreFilterBarProps = {
  query: ExploreQueryState;
  resultLabel?: string;
};

export function ExploreFilterBar({ query, resultLabel }: ExploreFilterBarProps) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
        <Search className="size-4 text-teal-700" aria-hidden="true" />
        통합 탐색 조건
      </h2>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-medium text-slate-500">검색어</dt>
          <dd className="mt-1 text-slate-900">{query.keyword || "전체"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">지역</dt>
          <dd className="mt-1 text-slate-900">
            {[query.ctprvnNm, query.signguNm, query.adongNm].filter(Boolean).join(" ") ||
              "전체"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">업종</dt>
          <dd className="mt-1 text-slate-900">
            {[query.indsLclsNm, query.indsMclsNm, query.indsSclsNm]
              .filter(Boolean)
              .join(" > ") || "전체"}
          </dd>
        </div>
      </dl>
      {resultLabel ? (
        <p className="mt-3 text-sm text-slate-500">{resultLabel}</p>
      ) : null}
    </section>
  );
}
