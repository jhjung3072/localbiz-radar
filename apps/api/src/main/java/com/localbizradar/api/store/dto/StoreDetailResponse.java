package com.localbizradar.api.store.dto;

import java.math.BigDecimal;

import com.localbizradar.api.store.domain.Store;

public record StoreDetailResponse(
		Long id,
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
		BigDecimal longitude
) {

	public static StoreDetailResponse from(Store store) {
		return new StoreDetailResponse(
				store.getId(),
				store.getStoreName(),
				store.getBranchName(),
				store.getCategoryLargeCode(),
				store.getCategoryLargeName(),
				store.getCategoryMediumCode(),
				store.getCategoryMediumName(),
				store.getCategorySmallCode(),
				store.getCategorySmallName(),
				store.getSido(),
				store.getSigungu(),
				store.getDong(),
				store.getLotAddress(),
				store.getRoadAddress(),
				store.getLatitude(),
				store.getLongitude());
	}
}
