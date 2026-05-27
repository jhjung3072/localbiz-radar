package com.localbizradar.api.store.repository;

import java.util.List;
import java.util.Optional;

import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.dto.CategoryRow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface StoreRepository extends JpaRepository<Store, Long>, JpaSpecificationExecutor<Store> {

	@Query("""
			select distinct new com.localbizradar.api.store.dto.CategoryRow(
				s.categoryLargeCode,
				s.categoryLargeName,
				s.categoryMediumCode,
				s.categoryMediumName,
				s.categorySmallCode,
				s.categorySmallName
			)
			from Store s
			order by s.categoryLargeName, s.categoryMediumName, s.categorySmallName
			""")
	List<CategoryRow> findCategoryRows();

	Optional<Store> findBySourceSystemAndExternalStoreId(String sourceSystem, String externalStoreId);
}
