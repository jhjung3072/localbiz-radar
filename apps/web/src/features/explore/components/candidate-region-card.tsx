import { Building2, MapPin, X } from "lucide-react";
import { candidateCompareLabel, candidateRegionLabel } from "@/features/explore/lib/region-label";
import type { CandidateItem } from "@/features/explore/types";

type CandidateRegionCardProps = {
  candidate: CandidateItem;
  selected?: boolean;
  onSelect?: (candidate: CandidateItem) => void;
  onRemove?: (candidateId: string) => void;
};

export function CandidateRegionCard({
  candidate,
  selected = false,
  onSelect,
  onRemove,
}: CandidateRegionCardProps) {
  const isStore = candidate.type === "STORE";

  return (
    <div
      className={
        selected
          ? "rounded-[8px] border border-teal-300 bg-teal-50 p-3"
          : "rounded-[8px] border border-slate-200 bg-white p-3"
      }
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          {isStore ? (
            <Building2 className="size-4" aria-hidden="true" />
          ) : (
            <MapPin className="size-4" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-950">
            {candidateCompareLabel(candidate)}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {candidateRegionLabel(candidate)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {isStore ? candidate.categoryName : `출처: ${candidate.source}`}
          </p>
        </div>
        {onRemove ? (
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-slate-300"
            onClick={() => onRemove(candidate.id)}
            aria-label={`${candidateCompareLabel(candidate)} 후보 삭제`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {onSelect ? (
        <button
          type="button"
          className="mt-3 h-8 w-full rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/30"
          onClick={() => onSelect(candidate)}
          aria-pressed={selected}
        >
          {selected ? "선택됨" : "비교 후보 선택"}
        </button>
      ) : null}
    </div>
  );
}
