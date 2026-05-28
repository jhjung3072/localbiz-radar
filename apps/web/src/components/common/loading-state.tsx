import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function LoadingState({
  title = "데이터를 불러오는 중입니다",
  description = "잠시만 기다려 주세요.",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-teal-200 bg-teal-50 p-5 text-teal-900",
        className,
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-teal-800/85">{description}</p>
    </div>
  );
}
