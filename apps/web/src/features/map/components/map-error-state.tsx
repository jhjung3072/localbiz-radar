import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type MapErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function MapErrorState({
  title = "점포 정보를 불러오지 못했습니다",
  description = "API 서버와 네트워크 설정을 확인한 뒤 다시 시도해 주세요.",
  onRetry,
}: MapErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-[8px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
    >
      <div className="flex items-center gap-2 font-semibold">
        <AlertCircle className="size-4" aria-hidden="true" />
        <span>{title}</span>
      </div>
      <p className="mt-2 leading-6 opacity-90">{description}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
          onClick={onRetry}
        >
          다시 시도
        </Button>
      ) : null}
    </div>
  );
}
