import type { PageResponse } from "@/features/stores/types";

export type SyncStatus = "RUNNING" | "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";

export type SyncType = "STORE_CSV_IMPORT" | "STORE_OPENAPI_SYNC";

export type StoreCsvRowError = {
  rowNumber: number;
  message: string;
};

export type StoreCsvImportResult = {
  syncLogId: number;
  status: SyncStatus;
  dryRun: boolean;
  totalRows: number;
  successRows: number;
  failedRows: number;
  skippedRows: number;
  message: string;
  errors: StoreCsvRowError[];
};

export type StoreOpenApiRowError = {
  pageNo: number;
  rowNumber: number;
  message: string;
};

export type StoreOpenApiSyncPayload = {
  operation?: "DONG" | "RADIUS" | "DATE";
  sidoName?: string;
  sigunguName?: string;
  dongName?: string;
  categoryLargeCode?: string;
  categoryMediumCode?: string;
  categorySmallCode?: string;
  divId?: "ctprvnCd" | "signguCd" | "adongCd";
  key?: string;
  radius?: number;
  cx?: number;
  cy?: number;
  changedDate?: string;
  pageNo?: number;
  pageSize?: number;
  maxPages?: number;
  dryRun?: boolean;
};

export type StoreOpenApiSyncResult = {
  syncLogId: number;
  status: SyncStatus;
  dryRun: boolean;
  requestedPages: number;
  fetchedRows: number;
  successRows: number;
  failedRows: number;
  skippedRows: number;
  insertedRows: number;
  updatedRows: number;
  message: string;
  errors: StoreOpenApiRowError[];
};

export type StoreOpenApiStatus = {
  enabled: boolean;
  serviceKeyConfigured: boolean;
  baseUrlConfigured: boolean;
  schedulerEnabled: boolean;
  cron: string;
  defaultPageSize: number;
  maxPagesPerRun: number;
  lastSyncStartedAt: string | null;
  lastSyncStatus: SyncStatus | null;
};

export type StoreSyncResult = StoreCsvImportResult | StoreOpenApiSyncResult;

export type SyncLogListItem = {
  id: number;
  syncType: SyncType;
  sourceName: string;
  status: SyncStatus;
  dryRun: boolean;
  totalRows: number;
  successRows: number;
  failedRows: number;
  skippedRows: number;
  startedAt: string;
  finishedAt: string | null;
  message: string | null;
};

export type SyncLogDetail = SyncLogListItem & {
  errorSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SyncLogSearchParams = {
  page: number;
  size: number;
  status?: SyncStatus | "all";
  syncType?: SyncType | "all";
};

export type SyncLogPage = PageResponse<SyncLogListItem>;
