import { Trophy } from "lucide-react";
import type { CompareRegionsResult } from "@/features/compare/types";

export function WinnerInsightCard({ result }: { result: CompareRegionsResult }) {
  return (
    <section className="rounded-[8px] border border-teal-200 bg-teal-50 p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-teal-700 ring-1 ring-teal-100">
          <Trophy className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-teal-800">추천 지역</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            {result.winner.regionLabel}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {result.winner.reason}
          </p>
        </div>
      </div>
    </section>
  );
}
