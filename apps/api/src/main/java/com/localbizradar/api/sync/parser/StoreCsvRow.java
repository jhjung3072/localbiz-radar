package com.localbizradar.api.sync.parser;

import java.math.BigDecimal;

public record StoreCsvRow(
		long rowNumber,
		String externalStoreId,
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
		BigDecimal longitude,
		BigDecimal latitude
) {
}
