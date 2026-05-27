import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusPlaceholderProps = {
  title: string;
  description: string;
  type: "loading" | "empty" | "error";
};

const iconMap: Record<StatusPlaceholderProps["type"], ReactNode> = {
  loading: <Loader2 className="size-4 animate-spin" aria-hidden="true" />,
  empty: <CheckCircle2 className="size-4" aria-hidden="true" />,
  error: <AlertCircle className="size-4" aria-hidden="true" />,
};

const typeClasses = {
  loading: "border-teal-200 bg-teal-50 text-teal-800",
  empty: "border-slate-200 bg-slate-50 text-slate-700",
  error: "border-rose-200 bg-rose-50 text-rose-800",
};

export function StatusPlaceholder({
  title,
  description,
  type,
}: StatusPlaceholderProps) {
  return (
    <div className={cn("rounded-[8px] border p-4", typeClasses[type])}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {iconMap[type]}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-sm leading-6 opacity-85">{description}</p>
    </div>
  );
}
