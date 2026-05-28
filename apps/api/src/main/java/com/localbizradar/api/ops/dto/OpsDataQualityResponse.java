package com.localbizradar.api.ops.dto;

public record OpsDataQualityResponse(
		long totalStores,
		long missingCoordinateCount,
		long missingRoadAddressCount,
		long missingLotAddressCount,
		long missingCategoryCount,
		long duplicateExternalStoreCount,
		double coordinateCoverageRate,
		double addressCoverageRate,
		double categoryCoverageRate
) {
}
