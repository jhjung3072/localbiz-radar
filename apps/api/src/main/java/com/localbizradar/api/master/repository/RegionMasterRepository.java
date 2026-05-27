package com.localbizradar.api.master.repository;

import java.util.List;
import java.util.Optional;

import com.localbizradar.api.master.domain.RegionMaster;
import com.localbizradar.api.master.domain.RegionType;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionMasterRepository extends JpaRepository<RegionMaster, Long> {

	Optional<RegionMaster> findByRegionTypeAndCode(RegionType regionType, String code);

	List<RegionMaster> findByRegionTypeOrderByNameAsc(RegionType regionType);

	List<RegionMaster> findByRegionTypeAndParentCodeOrderByNameAsc(RegionType regionType, String parentCode);

	long countByRegionType(RegionType regionType);

	boolean existsByRegionType(RegionType regionType);
}
