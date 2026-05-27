package com.localbizradar.api.master.dto;

import java.time.LocalDateTime;

import com.localbizradar.api.sync.domain.SyncStatus;

public record MasterDataStatusResponse(
		long regionMasterCount,
		long categoryMasterCount,
		long sidoCount,
		long sigunguCount,
		long adminDongCount,
		long legalDongCount,
		long largeCategoryCount,
		long mediumCategoryCount,
		long smallCategoryCount,
		LocalDateTime lastRegionSyncAt,
		LocalDateTime lastCategorySyncAt,
		SyncStatus lastRegionSyncStatus,
		SyncStatus lastCategorySyncStatus
) {
}
