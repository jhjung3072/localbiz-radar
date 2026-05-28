import type { ReactNode } from "react";
import { Activity, Clock3, Server } from "lucide-react";
import type { OpsOverview } from "@/features/ops/types";
import { formatDateTime, formatDuration } from "@/features/ops/components/ops-format";

type OpsHealthStatusProps = {
  service: OpsOverview["service"];
};

export function OpsHealthStatus({ service }: OpsHealthStatusProps) {
  const isUp = service.status === "UP";

  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-500">서비스 상태</h2>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-950">
            <Activity className={isUp ? "size-5 text-teal-700" : "size-5 text-rose-700"} aria-hidden="true" />
            {isUp ? "정상" : service.status}
          </p>
        </div>
        <span
          className={
            isUp
              ? "inline-flex w-fit rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-100"
              : "inline-flex w-fit rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-800 ring-1 ring-rose-100"
          }
        >
          {service.profile}
        </span>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <InfoItem
          icon={<Server className="size-4" aria-hidden="true" />}
          label="서비스"
          value={service.name}
        />
        <InfoItem
          icon={<Clock3 className="size-4" aria-hidden="true" />}
          label="시작 시각"
          value={formatDateTime(service.startedAt)}
        />
        <InfoItem
          icon={<Activity className="size-4" aria-hidden="true" />}
          label="가동 시간"
          value={formatDuration(service.uptimeSeconds)}
        />
      </dl>
    </section>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  );
}
