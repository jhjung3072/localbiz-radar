import type { Meta, StoryObj } from "@storybook/nextjs";
import { DataQualityCard } from "@/features/ops/components/data-quality-card";
import { OpsHealthStatus } from "@/features/ops/components/ops-health-status";
import { OpsOverviewCards } from "@/features/ops/components/ops-overview-cards";
import { SyncSummaryCard } from "@/features/ops/components/sync-summary-card";
import type {
  OpsDataQuality,
  OpsOverview,
  OpsSyncSummary,
} from "@/features/ops/types";

const meta = {
  title: "Ops/Dashboard",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const overview: OpsOverview = {
  service: {
    name: "localbiz-radar-api",
    status: "UP",
    profile: "local",
    startedAt: "2026-05-28T09:00:00",
    uptimeSeconds: 7320,
  },
  data: {
    totalStores: 12000,
    storesWithCoordinates: 11840,
    storesWithoutCoordinates: 160,
    regionMasterCount: 450,
    categoryMasterCount: 1200,
  },
  sync: {
    lastSyncType: "STORE_OPENAPI_SYNC",
    lastSyncStatus: "SUCCESS",
    lastSyncFinishedAt: "2026-05-28T10:00:00",
    failedSyncCountLast24h: 1,
  },
};

const syncSummary: OpsSyncSummary = {
  days: 7,
  totalRuns: 15,
  successRuns: 12,
  partialSuccessRuns: 2,
  failedRuns: 1,
  byType: [
    {
      syncType: "STORE_OPENAPI_SYNC",
      totalRuns: 6,
      successRuns: 5,
      partialSuccessRuns: 0,
      failedRuns: 1,
    },
    {
      syncType: "STORE_CSV_IMPORT",
      totalRuns: 3,
      successRuns: 2,
      partialSuccessRuns: 1,
      failedRuns: 0,
    },
  ],
  recentFailures: [
    {
      syncLogId: 10,
      syncType: "STORE_OPENAPI_SYNC",
      status: "FAILED",
      message: "OpenAPI 호출 제한으로 동기화가 실패했습니다.",
      finishedAt: "2026-05-28T10:00:00",
    },
  ],
};

const dataQuality: OpsDataQuality = {
  totalStores: 12000,
  missingCoordinateCount: 160,
  missingRoadAddressCount: 90,
  missingLotAddressCount: 120,
  missingCategoryCount: 12,
  duplicateExternalStoreCount: 0,
  coordinateCoverageRate: 98.7,
  addressCoverageRate: 99.3,
  categoryCoverageRate: 99.9,
};

export const HealthStatus: Story = {
  render: () => <OpsHealthStatus service={overview.service} />,
};

export const OverviewCards: Story = {
  render: () => <OpsOverviewCards overview={overview} />,
};

export const SyncSummary: Story = {
  render: () => <SyncSummaryCard syncSummary={syncSummary} />,
};

export const DataQuality: Story = {
  render: () => <DataQualityCard dataQuality={dataQuality} />,
};
