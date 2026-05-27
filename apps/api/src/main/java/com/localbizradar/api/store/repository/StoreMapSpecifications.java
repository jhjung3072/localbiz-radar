package com.localbizradar.api.store.repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;

import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.dto.StoreMapRequest;
import com.localbizradar.api.store.dto.StoreNearbyRequest;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class StoreMapSpecifications {

	private StoreMapSpecifications() {
	}

	public static Specification<Store> forMap(StoreMapRequest request) {
		return (root, query, criteriaBuilder) -> {
			List<Predicate> predicates = basePredicates(root, criteriaBuilder);
			addRegionPredicates(predicates, criteriaBuilder, root.get("sido"), root.get("sigungu"), root.get("dong"),
					request.getSido(), request.getSigungu(), request.getDong());
			addCategoryPredicates(predicates, criteriaBuilder, root, request.getCategoryLargeCode(),
					request.getCategoryMediumCode(), request.getCategorySmallCode());

			if (request.hasViewport()) {
				addViewportPredicates(predicates, criteriaBuilder, root, request.getMinLat(), request.getMaxLat(),
						request.getMinLng(), request.getMaxLng());
			}

			return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
		};
	}

	public static Specification<Store> forNearby(StoreNearbyRequest request) {
		return (root, query, criteriaBuilder) -> {
			List<Predicate> predicates = basePredicates(root, criteriaBuilder);
			addCategoryPredicates(predicates, criteriaBuilder, root, request.getCategoryLargeCode(),
					request.getCategoryMediumCode(), request.getCategorySmallCode());
			addBoundingBoxPredicates(predicates, criteriaBuilder, root, request.getLat(), request.getLng(),
					request.getRadius());

			return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
		};
	}

	private static List<Predicate> basePredicates(
			jakarta.persistence.criteria.Root<Store> root,
			CriteriaBuilder criteriaBuilder
	) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.isNotNull(root.get("latitude")));
		predicates.add(criteriaBuilder.isNotNull(root.get("longitude")));
		return predicates;
	}

	private static void addRegionPredicates(
			List<Predicate> predicates,
			CriteriaBuilder criteriaBuilder,
			Path<String> sidoPath,
			Path<String> sigunguPath,
			Path<String> dongPath,
			String sido,
			String sigungu,
			String dong
	) {
		addEqualPredicate(predicates, criteriaBuilder, sidoPath, sido);
		addEqualPredicate(predicates, criteriaBuilder, sigunguPath, sigungu);
		addEqualPredicate(predicates, criteriaBuilder, dongPath, dong);
	}

	private static void addCategoryPredicates(
			List<Predicate> predicates,
			CriteriaBuilder criteriaBuilder,
			jakarta.persistence.criteria.Root<Store> root,
			String categoryLargeCode,
			String categoryMediumCode,
			String categorySmallCode
	) {
		addEqualPredicate(predicates, criteriaBuilder, root.get("categoryLargeCode"), categoryLargeCode);
		addEqualPredicate(predicates, criteriaBuilder, root.get("categoryMediumCode"), categoryMediumCode);
		addEqualPredicate(predicates, criteriaBuilder, root.get("categorySmallCode"), categorySmallCode);
	}

	private static void addViewportPredicates(
			List<Predicate> predicates,
			CriteriaBuilder criteriaBuilder,
			jakarta.persistence.criteria.Root<Store> root,
			Double minLat,
			Double maxLat,
			Double minLng,
			Double maxLng
	) {
		double lowerLat = Math.min(minLat, maxLat);
		double upperLat = Math.max(minLat, maxLat);
		double lowerLng = Math.min(minLng, maxLng);
		double upperLng = Math.max(minLng, maxLng);

		predicates.add(criteriaBuilder.between(root.get("latitude"), BigDecimal.valueOf(lowerLat), BigDecimal.valueOf(upperLat)));
		predicates.add(criteriaBuilder.between(root.get("longitude"), BigDecimal.valueOf(lowerLng), BigDecimal.valueOf(upperLng)));
	}

	private static void addBoundingBoxPredicates(
			List<Predicate> predicates,
			CriteriaBuilder criteriaBuilder,
			jakarta.persistence.criteria.Root<Store> root,
			double lat,
			double lng,
			int radius
	) {
		double latDelta = radius / 111_320.0;
		double lngDelta = radius / (111_320.0 * Math.max(Math.cos(Math.toRadians(lat)), 0.1));

		addViewportPredicates(predicates, criteriaBuilder, root, lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta);
	}

	private static void addEqualPredicate(
			List<Predicate> predicates,
			CriteriaBuilder criteriaBuilder,
			Path<String> path,
			String value
	) {
		if (StringUtils.hasText(value)) {
			predicates.add(criteriaBuilder.equal(path, value.trim()));
		}
	}
}
