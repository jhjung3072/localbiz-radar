package com.localbizradar.api.analysis.repository;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;

import com.localbizradar.api.analysis.dto.AnalysisCondition;
import com.localbizradar.api.store.domain.Store;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class AnalysisStoreSpecifications {

	private AnalysisStoreSpecifications() {
	}

	public static Specification<Store> byCondition(AnalysisCondition condition) {
		return (root, query, criteriaBuilder) -> {
			List<Predicate> predicates = new ArrayList<>();

			addEqualPredicate(predicates, criteriaBuilder, root.get("sido"), condition.sido());
			addEqualPredicate(predicates, criteriaBuilder, root.get("sigungu"), condition.sigungu());
			addEqualPredicate(predicates, criteriaBuilder, root.get("dong"), condition.dong());
			addEqualPredicate(predicates, criteriaBuilder, root.get("categoryLargeCode"), condition.categoryLargeCode());
			addEqualPredicate(predicates, criteriaBuilder, root.get("categoryMediumCode"), condition.categoryMediumCode());
			addEqualPredicate(predicates, criteriaBuilder, root.get("categorySmallCode"), condition.categorySmallCode());

			return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
		};
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
