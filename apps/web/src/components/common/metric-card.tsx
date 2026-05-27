import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  accent?: "teal" | "indigo" | "amber" | "rose" | "slate";
};

const accentClasses = {
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function MetricCard({
  title,
  value,
  description,
  icon,
  accent = "teal",
}: MetricCardProps) {
  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            {value}
          </p>
        </div>
        {icon ? (
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-md ring-1",
              accentClasses[accent],
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
    </article>
  );
}
