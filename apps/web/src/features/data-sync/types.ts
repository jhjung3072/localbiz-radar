import type { PageResponse } from "@/features/stores/types";

export type SyncStatus = "RUNNING" | "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";

export type SyncType = "STORE_CSV_IMPORT";

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
