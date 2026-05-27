package com.localbizradar.api.region.repository;

import java.util.List;
import java.util.Optional;

import com.localbizradar.api.region.domain.Region;
import com.localbizradar.api.region.dto.RegionRow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RegionRepository extends JpaRepository<Region, Long> {

	@Query("""
			select new com.localbizradar.api.region.dto.RegionRow(
				r.sidoCode,
				r.sidoName,
				r.sigunguCode,
				r.sigunguName,
				r.dongCode,
				r.dongName
			)
			from Region r
			order by r.sidoName, r.sigunguName, r.dongName
			""")
	List<RegionRow> findRegionRows();

	Optional<Region> findFirstBySidoNameAndSigunguNameAndDongNameOrderByDongNameAsc(
			String sidoName,
			String sigunguName,
			String dongName);

	Optional<Region> findFirstBySidoNameAndSigunguNameOrderByDongNameAsc(
			String sidoName,
			String sigunguName);

	Optional<Region> findFirstBySidoNameOrderBySigunguNameAscDongNameAsc(String sidoName);
}
