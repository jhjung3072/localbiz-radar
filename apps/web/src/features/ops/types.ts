export type OpsSyncStatus = "RUNNING" | "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";

export type OpsSyncType =
  | "STORE_CSV_IMPORT"
  | "STORE_OPENAPI_SYNC"
  | "REGION_MASTER_OPENAPI_SYNC"
  | "CATEGORY_MASTER_OPENAPI_SYNC";

export type OpsOverview = {
  service: {
    name: string;
    status: string;
    profile: string;
    startedAt: string;
    uptimeSeconds: number;
  };
  data: {
    totalStores: number;
    storesWithCoordinates: number;
    storesWithoutCoordinates: number;
    regionMasterCount: number;
    categoryMasterCount: number;
  };
  sync: {
    lastSyncType: OpsSyncType | null;
    lastSyncStatus: OpsSyncStatus | null;
    lastSyncFinishedAt: string | null;
    failedSyncCountLast24h: number;
  };
};

export type OpsSyncSummary = {
  days: number;
  totalRuns: number;
  successRuns: number;
  partialSuccessRuns: number;
  failedRuns: number;
  byType: Array<{
    syncType: OpsSyncType;
    totalRuns: number;
    successRuns: number;
    partialSuccessRuns: number;
    failedRuns: number;
  }>;
  recentFailures: Array<{
    syncLogId: number;
    syncType: OpsSyncType;
    status: OpsSyncStatus;
    message: string | null;
    finishedAt: string | null;
  }>;
};

export type OpsDataQuality = {
  totalStores: number;
  missingCoordinateCount: number;
  missingRoadAddressCount: number;
  missingLotAddressCount: number;
  missingCategoryCount: number;
  duplicateExternalStoreCount: number;
  coordinateCoverageRate: number;
  addressCoverageRate: number;
  categoryCoverageRate: number;
};
