import { Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CompareSelection } from "@/features/compare/types";
import type { RecentComparison } from "@/features/compare/lib/recent-comparison-storage";

type RecentComparisonsProps = {
  items: RecentComparison[];
  onSelect: (selection: CompareSelection) => void;
};

export function RecentComparisons({ items, onSelect }: RecentComparisonsProps) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
        <Clock3 className="size-5 text-slate-500" aria-hidden="true" />
        최근 비교 조건
      </h2>
      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <Button
              key={`${item.savedAt}-${item.label}`}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelect(item)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          아직 저장된 비교 조건이 없습니다.
        </p>
      )}
    </section>
  );
}
