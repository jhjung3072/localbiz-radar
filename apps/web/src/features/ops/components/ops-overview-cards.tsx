import { Database, MapPin, RefreshCw, Store } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import type { OpsOverview } from "@/features/ops/types";
import {
  formatDateTime,
  formatNumber,
  syncStatusLabel,
  syncTypeLabel,
} from "@/features/ops/components/ops-format";

type OpsOverviewCardsProps = {
  overview: OpsOverview;
};

export function OpsOverviewCards({ overview }: OpsOverviewCardsProps) {
  return (
    <section aria-labelledby="ops-data-summary-heading" className="space-y-4">
      <div>
        <h2 id="ops-data-summary-heading" className="text-xl font-semibold text-slate-950">
          데이터 요약
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          점포 데이터와 마스터 데이터의 현재 적재 상태입니다.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="총 점포 수"
          value={formatNumber(overview.data.totalStores)}
          description="stores table 기준 전체 점포 수"
          icon={<Store className="size-5" />}
          accent="teal"
        />
        <MetricCard
          title="좌표 보유 점포"
          value={formatNumber(overview.data.storesWithCoordinates)}
          description={`${formatNumber(overview.data.storesWithoutCoordinates)}개 점포는 좌표가 없습니다.`}
          icon={<MapPin className="size-5" />}
          accent="indigo"
        />
        <MetricCard
          title="마스터 데이터"
          value={formatNumber(
            overview.data.regionMasterCount + overview.data.categoryMasterCount,
          )}
          description={`지역 ${formatNumber(overview.data.regionMasterCount)}개, 업종 ${formatNumber(overview.data.categoryMasterCount)}개`}
          icon={<Database className="size-5" />}
          accent="amber"
        />
        <MetricCard
          title="최근 동기화"
          value={syncStatusLabel(overview.sync.lastSyncStatus)}
          description={`${syncTypeLabel(overview.sync.lastSyncType)} · ${formatDateTime(overview.sync.lastSyncFinishedAt)}`}
          icon={<RefreshCw className="size-5" />}
          accent={overview.sync.lastSyncStatus === "FAILED" ? "rose" : "slate"}
        />
      </div>
    </section>
  );
}
