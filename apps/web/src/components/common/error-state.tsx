import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "데이터를 불러오지 못했습니다",
  description = "잠시 후 다시 시도해 주세요.",
  retryLabel = "다시 시도",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-[8px] border border-rose-200 bg-rose-50 p-5 text-rose-900",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <AlertCircle className="size-4" aria-hidden="true" />
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-rose-800/90">{description}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
