import { CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function EmptyState({
  title = "표시할 데이터가 없습니다",
  description = "조건을 변경한 뒤 다시 확인해 주세요.",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-slate-200 bg-slate-50 p-5 text-slate-700",
        className,
      )}
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <CircleOff className="size-4" aria-hidden="true" />
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
