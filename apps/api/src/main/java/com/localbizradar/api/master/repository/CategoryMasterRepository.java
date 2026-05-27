package com.localbizradar.api.master.repository;

import java.util.List;
import java.util.Optional;

import com.localbizradar.api.master.domain.CategoryLevel;
import com.localbizradar.api.master.domain.CategoryMaster;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryMasterRepository extends JpaRepository<CategoryMaster, Long> {

	Optional<CategoryMaster> findByCategoryLevelAndCode(CategoryLevel categoryLevel, String code);

	List<CategoryMaster> findByCategoryLevelOrderByNameAsc(CategoryLevel categoryLevel);

	List<CategoryMaster> findByCategoryLevelAndParentCodeOrderByNameAsc(CategoryLevel categoryLevel, String parentCode);

	long countByCategoryLevel(CategoryLevel categoryLevel);

	boolean existsByCategoryLevel(CategoryLevel categoryLevel);
}
