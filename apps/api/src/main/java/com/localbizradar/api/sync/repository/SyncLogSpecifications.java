package com.localbizradar.api.sync.repository;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.criteria.Predicate;

import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.dto.SyncLogSearchRequest;

import org.springframework.data.jpa.domain.Specification;

public final class SyncLogSpecifications {

	private SyncLogSpecifications() {
	}

	public static Specification<SyncLog> bySearchRequest(SyncLogSearchRequest request) {
		return (root, query, criteriaBuilder) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (request.getStatus() != null) {
				predicates.add(criteriaBuilder.equal(root.get("status"), request.getStatus()));
			}
			if (request.getSyncType() != null) {
				predicates.add(criteriaBuilder.equal(root.get("syncType"), request.getSyncType()));
			}

			return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
		};
	}
}
