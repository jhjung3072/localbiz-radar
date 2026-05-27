package com.localbizradar.api.store.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.dto.StoreMapItemResponse;
import com.localbizradar.api.store.dto.StoreMapRequest;
import com.localbizradar.api.store.dto.StoreNearbyItemResponse;
import com.localbizradar.api.store.dto.StoreNearbyRequest;
import com.localbizradar.api.store.repository.StoreMapSpecifications;
import com.localbizradar.api.store.repository.StoreRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class StoreMapService {

	private static final double EARTH_RADIUS_METERS = 6_371_000.0;

	private final StoreRepository storeRepository;

	public StoreMapService(StoreRepository storeRepository) {
		this.storeRepository = storeRepository;
	}

	public List<StoreMapItemResponse> getMapStores(StoreMapRequest request) {
		return storeRepository.findAll(
						StoreMapSpecifications.forMap(request),
						PageRequest.of(0, request.getLimit(), Sort.by("storeName").ascending().and(Sort.by("id").ascending())))
				.getContent()
				.stream()
				.filter(this::hasCoordinates)
				.filter(store -> matchesMapRequest(store, request))
				.map(StoreMapItemResponse::from)
				.toList();
	}

	public List<StoreNearbyItemResponse> getNearbyStores(StoreNearbyRequest request) {
		return storeRepository.findAll(
						StoreMapSpecifications.forNearby(request),
				Sort.by("storeName").ascending().and(Sort.by("id").ascending()))
				.stream()
				.filter(this::hasCoordinates)
				.filter(store -> matchesNearbyRequest(store, request))
				.map(store -> new StoreDistance(store, distanceMeters(request.getLat(), request.getLng(), store)))
				.filter(storeDistance -> storeDistance.distanceMeters() <= request.getRadius())
				.sorted(Comparator
						.comparingDouble(StoreDistance::distanceMeters)
						.thenComparing(storeDistance -> storeDistance.store().getStoreName()))
				.limit(request.getLimit())
				.map(storeDistance -> StoreNearbyItemResponse.from(
						storeDistance.store(),
						round(storeDistance.distanceMeters())))
				.toList();
	}

	private boolean hasCoordinates(Store store) {
		return store.getLatitude() != null && store.getLongitude() != null;
	}

	private boolean matchesMapRequest(Store store, StoreMapRequest request) {
		return matchesText(store.getSido(), request.getSido())
				&& matchesText(store.getSigungu(), request.getSigungu())
				&& matchesText(store.getDong(), request.getDong())
				&& matchesText(store.getCategoryLargeCode(), request.getCategoryLargeCode())
				&& matchesText(store.getCategoryMediumCode(), request.getCategoryMediumCode())
				&& matchesText(store.getCategorySmallCode(), request.getCategorySmallCode())
				&& matchesViewport(store, request);
	}

	private boolean matchesNearbyRequest(Store store, StoreNearbyRequest request) {
		return matchesText(store.getCategoryLargeCode(), request.getCategoryLargeCode())
				&& matchesText(store.getCategoryMediumCode(), request.getCategoryMediumCode())
				&& matchesText(store.getCategorySmallCode(), request.getCategorySmallCode());
	}

	private boolean matchesText(String actualValue, String requestedValue) {
		return !StringUtils.hasText(requestedValue) || Objects.equals(actualValue, requestedValue.trim());
	}

	private boolean matchesViewport(Store store, StoreMapRequest request) {
		if (!request.hasViewport()) {
			return true;
		}

		double latitude = store.getLatitude().doubleValue();
		double longitude = store.getLongitude().doubleValue();
		double lowerLat = Math.min(request.getMinLat(), request.getMaxLat());
		double upperLat = Math.max(request.getMinLat(), request.getMaxLat());
		double lowerLng = Math.min(request.getMinLng(), request.getMaxLng());
		double upperLng = Math.max(request.getMinLng(), request.getMaxLng());

		return latitude >= lowerLat && latitude <= upperLat && longitude >= lowerLng && longitude <= upperLng;
	}

	private double distanceMeters(double lat, double lng, Store store) {
		BigDecimal storeLatitude = store.getLatitude();
		BigDecimal storeLongitude = store.getLongitude();
		if (storeLatitude == null || storeLongitude == null) {
			return Double.MAX_VALUE;
		}

		double latDistance = Math.toRadians(storeLatitude.doubleValue() - lat);
		double lngDistance = Math.toRadians(storeLongitude.doubleValue() - lng);
		double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
				+ Math.cos(Math.toRadians(lat))
				* Math.cos(Math.toRadians(storeLatitude.doubleValue()))
				* Math.sin(lngDistance / 2)
				* Math.sin(lngDistance / 2);

		return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	}

	private double round(double value) {
		return BigDecimal.valueOf(value)
				.setScale(1, RoundingMode.HALF_UP)
				.doubleValue();
	}

	private record StoreDistance(Store store, double distanceMeters) {
	}
}
