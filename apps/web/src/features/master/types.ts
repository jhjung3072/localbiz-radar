import type { SyncStatus, SyncType } from "@/features/data-sync/types";

export type MasterRegion = {
  ctprvnCd: string;
  ctprvnNm: string;
  sigunguList: MasterSigungu[];
};

export type MasterSigungu = {
  signguCd: string;
  signguNm: string;
  adminDongList: MasterDong[];
  legalDongList: MasterDong[];
};

export type MasterDong = {
  code: string;
  name: string;
};

export type MasterCategory = {
  indsLclsCd: string;
  indsLclsNm: string;
  mediumCategories: MasterMediumCategory[];
};

export type MasterMediumCategory = {
  indsMclsCd: string;
  indsMclsNm: string;
  smallCategories: MasterSmallCategory[];
};

export type MasterSmallCategory = {
  indsSclsCd: string;
  indsSclsNm: string;
};

export type MasterDataStatus = {
  regionMasterCount: number;
  categoryMasterCount: number;
  sidoCount: number;
  sigunguCount: number;
  adminDongCount: number;
  legalDongCount: number;
  largeCategoryCount: number;
  mediumCategoryCount: number;
  smallCategoryCount: number;
  lastRegionSyncAt: string | null;
  lastCategorySyncAt: string | null;
  lastRegionSyncStatus: SyncStatus | null;
  lastCategorySyncStatus: SyncStatus | null;
};

export type RegionMasterSyncPayload = {
  ctprvnCd?: string;
  includeSigungu?: boolean;
  includeAdminDong?: boolean;
  includeLegalDong?: boolean;
  dryRun?: boolean;
  maxSigunguCount?: number;
  maxDongCountPerSigungu?: number;
};

export type CategoryMasterSyncPayload = {
  includeLarge?: boolean;
  includeMedium?: boolean;
  includeSmall?: boolean;
  largeCategoryCode?: string;
  mediumCategoryCode?: string;
  dryRun?: boolean;
  maxLargeCount?: number;
  maxMediumCount?: number;
  maxSmallCountPerMedium?: number;
};

export type MasterSyncError = {
  scope: string;
  message: string;
};

export type MasterSyncResult = {
  syncLogId: number;
  status: SyncStatus;
  dryRun: boolean;
  syncType: SyncType;
  requestedCount: number;
  fetchedRows: number;
  insertedRows: number;
  updatedRows: number;
  skippedRows: number;
  failedRows: number;
  message: string;
  errors: MasterSyncError[];
};
