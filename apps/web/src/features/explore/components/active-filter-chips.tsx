import { X } from "lucide-react";
import type { ExploreQueryState } from "@/features/explore/types";

type FilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type ActiveFilterChipsProps = {
  query: ExploreQueryState;
  onClearKeyword?: () => void;
  onClearRegion?: () => void;
  onClearCategory?: () => void;
  onClearAll?: () => void;
};

export function ActiveFilterChips({
  query,
  onClearKeyword,
  onClearRegion,
  onClearCategory,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips: FilterChip[] = [];

  if (query.keyword) {
    chips.push({
      key: "keyword",
      label: `검색어: ${query.keyword}`,
      onRemove: () => onClearKeyword?.(),
    });
  }

  const regionLabel = [query.ctprvnNm, query.signguNm, query.adongNm]
    .filter(Boolean)
    .join(" ");
  if (regionLabel) {
    chips.push({
      key: "region",
      label: `지역: ${regionLabel}`,
      onRemove: () => onClearRegion?.(),
    });
  }

  const categoryLabel = [query.indsLclsNm, query.indsMclsNm, query.indsSclsNm]
    .filter(Boolean)
    .join(" > ");
  if (categoryLabel) {
    chips.push({
      key: "category",
      label: `업종: ${categoryLabel}`,
      onRemove: () => onClearCategory?.(),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="적용된 필터">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-md border border-teal-100 bg-teal-50 px-2.5 text-sm font-medium text-teal-800 transition hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/30"
          onClick={chip.onRemove}
          aria-label={`${chip.label} 필터 제거`}
        >
          <span>{chip.label}</span>
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ))}
      {onClearAll ? (
        <button
          type="button"
          className="h-8 rounded-md px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-slate-300"
          onClick={onClearAll}
        >
          필터 초기화
        </button>
      ) : null}
    </div>
  );
}
