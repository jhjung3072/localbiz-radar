package com.localbizradar.api.store.dto;

import java.math.BigDecimal;

import com.localbizradar.api.store.domain.Store;

public record StoreNearbyItemResponse(
		Long id,
		String storeName,
		String categoryLargeCode,
		String categoryLargeName,
		String categoryMediumCode,
		String categoryMediumName,
		String categorySmallCode,
		String categorySmallName,
		String sido,
		String sigungu,
		String dong,
		String roadAddress,
		BigDecimal latitude,
		BigDecimal longitude,
		double distanceMeters
) {

	public static StoreNearbyItemResponse from(Store store, double distanceMeters) {
		return new StoreNearbyItemResponse(
				store.getId(),
				store.getStoreName(),
				store.getCategoryLargeCode(),
				store.getCategoryLargeName(),
				store.getCategoryMediumCode(),
				store.getCategoryMediumName(),
				store.getCategorySmallCode(),
				store.getCategorySmallName(),
				store.getSido(),
				store.getSigungu(),
				store.getDong(),
				store.getRoadAddress(),
				store.getLatitude(),
				store.getLongitude(),
				distanceMeters);
	}
}
