package com.localbizradar.api.sync.service;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StoreUpsertCommand(
		String externalStoreId,
		String sourceSystem,
		String storeName,
		String branchName,
		String categoryLargeCode,
		String categoryLargeName,
		String categoryMediumCode,
		String categoryMediumName,
		String categorySmallCode,
		String categorySmallName,
		String sido,
		String sigungu,
		String dong,
		String lotAddress,
		String roadAddress,
		BigDecimal latitude,
		BigDecimal longitude,
		String sidoCode,
		String sigunguCode,
		String adminDongCode,
		String legalDongCode,
		String legalDongName,
		String pnuCode,
		String buildingManagementNumber,
		String changeType,
		LocalDate changedAt
) {
}
