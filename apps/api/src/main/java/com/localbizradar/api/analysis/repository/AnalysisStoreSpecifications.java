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

			addCodeOrNamePredicate(
					predicates,
					criteriaBuilder,
					root.get("sidoCode"),
					root.get("sido"),
					condition.sidoCode(),
					condition.sido());
			addCodeOrNamePredicate(
					predicates,
					criteriaBuilder,
					root.get("sigunguCode"),
					root.get("sigungu"),
					condition.sigunguCode(),
					condition.sigungu());
			addCodeOrNamePredicate(
					predicates,
					criteriaBuilder,
					root.get("adminDongCode"),
					root.get("dong"),
					condition.adminDongCode(),
					condition.dong());
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

	private static void addCodeOrNamePredicate(
			List<Predicate> predicates,
			CriteriaBuilder criteriaBuilder,
			Path<String> codePath,
			Path<String> namePath,
			String code,
			String name
	) {
		if (StringUtils.hasText(code) && StringUtils.hasText(name)) {
			predicates.add(criteriaBuilder.or(
					criteriaBuilder.equal(codePath, code.trim()),
					criteriaBuilder.equal(namePath, name.trim())));
			return;
		}
		addEqualPredicate(predicates, criteriaBuilder, codePath, code);
		addEqualPredicate(predicates, criteriaBuilder, namePath, name);
	}
}
