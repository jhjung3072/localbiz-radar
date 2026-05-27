import type { ReactNode } from "react";
import { MapPinOff } from "lucide-react";

type MapEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function MapEmptyState({
  title,
  description,
  action,
}: MapEmptyStateProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-[8px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
        <MapPinOff className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
