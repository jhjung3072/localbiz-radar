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

	@Query("""
			select count(s)
			from Store s
			where s.latitude is not null and s.longitude is not null
			""")
	long countWithCoordinates();

	@Query("""
			select count(s)
			from Store s
			where s.latitude is null or s.longitude is null
			""")
	long countMissingCoordinates();

	@Query("""
			select count(s)
			from Store s
			where s.roadAddress is null or trim(s.roadAddress) = ''
			""")
	long countMissingRoadAddress();

	@Query("""
			select count(s)
			from Store s
			where s.lotAddress is null or trim(s.lotAddress) = ''
			""")
	long countMissingLotAddress();

	@Query("""
			select count(s)
			from Store s
			where s.categorySmallCode is null or trim(s.categorySmallCode) = ''
				or s.categorySmallName is null or trim(s.categorySmallName) = ''
			""")
	long countMissingCategory();

	@Query(value = """
			select count(*)
			from (
				select source_system, external_store_id
				from stores
				where source_system is not null
					and source_system <> ''
					and external_store_id is not null
					and external_store_id <> ''
				group by source_system, external_store_id
				having count(*) > 1
			) duplicated_stores
			""", nativeQuery = true)
	long countDuplicateExternalStores();
}
