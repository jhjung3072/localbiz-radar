import { Info } from "lucide-react";

type PerformanceNoticeProps = {
  message: string;
};

export function PerformanceNotice({ message }: PerformanceNoticeProps) {
  return (
    <div
      role="status"
      className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
    >
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </div>
  );
}
