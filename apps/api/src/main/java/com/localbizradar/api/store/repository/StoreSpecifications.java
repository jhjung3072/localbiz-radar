package com.localbizradar.api.store.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import jakarta.persistence.criteria.Predicate;

import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.dto.StoreSearchRequest;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class StoreSpecifications {

	private StoreSpecifications() {
	}

	public static Specification<Store> bySearchRequest(StoreSearchRequest request) {
		return (root, query, criteriaBuilder) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (StringUtils.hasText(request.getKeyword())) {
				String keyword = "%" + request.getKeyword().trim().toLowerCase(Locale.ROOT) + "%";
				predicates.add(criteriaBuilder.or(
						criteriaBuilder.like(criteriaBuilder.lower(root.get("storeName")), keyword),
						criteriaBuilder.like(criteriaBuilder.lower(root.get("roadAddress")), keyword),
						criteriaBuilder.like(criteriaBuilder.lower(root.get("lotAddress")), keyword)));
			}

			addEqualPredicate(predicates, criteriaBuilder, root.get("sido"), request.getSido());
			addEqualPredicate(predicates, criteriaBuilder, root.get("sigungu"), request.getSigungu());
			addEqualPredicate(predicates, criteriaBuilder, root.get("dong"), request.getDong());
			addEqualPredicate(predicates, criteriaBuilder, root.get("categoryLargeCode"), request.getCategoryLargeCode());
			addEqualPredicate(predicates, criteriaBuilder, root.get("categoryMediumCode"), request.getCategoryMediumCode());
			addEqualPredicate(predicates, criteriaBuilder, root.get("categorySmallCode"), request.getCategorySmallCode());

			return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
		};
	}

	private static void addEqualPredicate(
			List<Predicate> predicates,
			jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
			jakarta.persistence.criteria.Path<String> path,
			String value
	) {
		if (StringUtils.hasText(value)) {
			predicates.add(criteriaBuilder.equal(path, value.trim()));
		}
	}
}
