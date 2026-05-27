package com.localbizradar.api.master.service;

import java.util.ArrayList;
import java.util.List;

import com.localbizradar.api.master.domain.CategoryLevel;
import com.localbizradar.api.master.domain.CategoryMaster;
import com.localbizradar.api.master.domain.RegionMaster;
import com.localbizradar.api.master.domain.RegionType;
import com.localbizradar.api.master.dto.MasterCategoryResponse;
import com.localbizradar.api.master.dto.MasterDataStatusResponse;
import com.localbizradar.api.master.dto.MasterDongResponse;
import com.localbizradar.api.master.dto.MasterMediumCategoryResponse;
import com.localbizradar.api.master.dto.MasterRegionResponse;
import com.localbizradar.api.master.dto.MasterSigunguResponse;
import com.localbizradar.api.master.dto.MasterSmallCategoryResponse;
import com.localbizradar.api.master.repository.CategoryMasterRepository;
import com.localbizradar.api.master.repository.RegionMasterRepository;
import com.localbizradar.api.region.dto.DongResponse;
import com.localbizradar.api.region.dto.RegionResponse;
import com.localbizradar.api.region.dto.SigunguResponse;
import com.localbizradar.api.store.dto.CategoryResponse;
import com.localbizradar.api.store.dto.MediumCategoryResponse;
import com.localbizradar.api.store.dto.SmallCategoryResponse;
import com.localbizradar.api.sync.domain.SyncType;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class MasterDataQueryService {

	private final RegionMasterRepository regionMasterRepository;
	private final CategoryMasterRepository categoryMasterRepository;
	private final SyncLogRepository syncLogRepository;

	public MasterDataQueryService(
			RegionMasterRepository regionMasterRepository,
			CategoryMasterRepository categoryMasterRepository,
			SyncLogRepository syncLogRepository
	) {
		this.regionMasterRepository = regionMasterRepository;
		this.categoryMasterRepository = categoryMasterRepository;
		this.syncLogRepository = syncLogRepository;
	}

	public List<MasterRegionResponse> getRegions(
			boolean includeAdminDong,
			boolean includeLegalDong,
			String ctprvnCd,
			String signguCd
	) {
		return regionMasterRepository.findByRegionTypeOrderByNameAsc(RegionType.SIDO).stream()
				.filter(sido -> !StringUtils.hasText(ctprvnCd) || ctprvnCd.equals(sido.getCode()))
				.map(sido -> new MasterRegionResponse(
						sido.getCode(),
						sido.getName(),
						getSigunguList(sido.getCode(), includeAdminDong, includeLegalDong, signguCd)))
				.toList();
	}

	public List<MasterCategoryResponse> getCategories(String indsLclsCd, String indsMclsCd) {
		return categoryMasterRepository.findByCategoryLevelOrderByNameAsc(CategoryLevel.LARGE).stream()
				.filter(large -> !StringUtils.hasText(indsLclsCd) || indsLclsCd.equals(large.getCode()))
				.map(large -> new MasterCategoryResponse(
						large.getCode(),
						large.getName(),
						getMediumCategories(large.getCode(), indsMclsCd)))
				.toList();
	}

	public List<RegionResponse> getCompatibleRegions() {
		return getRegions(true, false, null, null).stream()
				.map(region -> new RegionResponse(
						region.ctprvnCd(),
						region.ctprvnNm(),
						region.sigunguList().stream()
								.map(sigungu -> new SigunguResponse(
										sigungu.signguCd(),
										sigungu.signguNm(),
										sigungu.adminDongList().stream()
												.map(dong -> new DongResponse(dong.code(), dong.name()))
												.toList()))
								.toList()))
				.toList();
	}

	public List<CategoryResponse> getCompatibleCategories() {
		return getCategories(null, null).stream()
				.map(large -> new CategoryResponse(
						large.indsLclsCd(),
						large.indsLclsNm(),
						large.mediumCategories().stream()
								.map(medium -> new MediumCategoryResponse(
										medium.indsMclsCd(),
										medium.indsMclsNm(),
										medium.smallCategories().stream()
												.map(small -> new SmallCategoryResponse(
														small.indsSclsCd(),
														small.indsSclsNm()))
												.toList()))
								.toList()))
				.toList();
	}

	public boolean hasRegionMasters() {
		return regionMasterRepository.existsByRegionType(RegionType.SIDO);
	}

	public boolean hasCategoryMasters() {
		return categoryMasterRepository.existsByCategoryLevel(CategoryLevel.LARGE);
	}

	public MasterDataStatusResponse getStatus() {
		var lastRegionSync = syncLogRepository.findFirstBySyncTypeOrderByStartedAtDesc(
				SyncType.REGION_MASTER_OPENAPI_SYNC);
		var lastCategorySync = syncLogRepository.findFirstBySyncTypeOrderByStartedAtDesc(
				SyncType.CATEGORY_MASTER_OPENAPI_SYNC);

		return new MasterDataStatusResponse(
				regionMasterRepository.count(),
				categoryMasterRepository.count(),
				regionMasterRepository.countByRegionType(RegionType.SIDO),
				regionMasterRepository.countByRegionType(RegionType.SIGUNGU),
				regionMasterRepository.countByRegionType(RegionType.ADMIN_DONG),
				regionMasterRepository.countByRegionType(RegionType.LEGAL_DONG),
				categoryMasterRepository.countByCategoryLevel(CategoryLevel.LARGE),
				categoryMasterRepository.countByCategoryLevel(CategoryLevel.MEDIUM),
				categoryMasterRepository.countByCategoryLevel(CategoryLevel.SMALL),
				lastRegionSync.map(syncLog -> syncLog.getStartedAt()).orElse(null),
				lastCategorySync.map(syncLog -> syncLog.getStartedAt()).orElse(null),
				lastRegionSync.map(syncLog -> syncLog.getStatus()).orElse(null),
				lastCategorySync.map(syncLog -> syncLog.getStatus()).orElse(null));
	}

	private List<MasterSigunguResponse> getSigunguList(
			String ctprvnCd,
			boolean includeAdminDong,
			boolean includeLegalDong,
			String signguCd
	) {
		return regionMasterRepository.findByRegionTypeAndParentCodeOrderByNameAsc(RegionType.SIGUNGU, ctprvnCd)
				.stream()
				.filter(sigungu -> !StringUtils.hasText(signguCd) || signguCd.equals(sigungu.getCode()))
				.map(sigungu -> new MasterSigunguResponse(
						sigungu.getCode(),
						sigungu.getName(),
						includeAdminDong ? getDongList(RegionType.ADMIN_DONG, sigungu.getCode()) : List.of(),
						includeLegalDong ? getDongList(RegionType.LEGAL_DONG, sigungu.getCode()) : List.of()))
				.toList();
	}

	private List<MasterDongResponse> getDongList(RegionType regionType, String signguCd) {
		return regionMasterRepository.findByRegionTypeAndParentCodeOrderByNameAsc(regionType, signguCd)
				.stream()
				.map(master -> new MasterDongResponse(master.getCode(), master.getName()))
				.toList();
	}

	private List<MasterMediumCategoryResponse> getMediumCategories(String indsLclsCd, String indsMclsCd) {
		return categoryMasterRepository.findByCategoryLevelAndParentCodeOrderByNameAsc(CategoryLevel.MEDIUM, indsLclsCd)
				.stream()
				.filter(medium -> !StringUtils.hasText(indsMclsCd) || indsMclsCd.equals(medium.getCode()))
				.map(medium -> new MasterMediumCategoryResponse(
						medium.getCode(),
						medium.getName(),
						getSmallCategories(medium.getCode())))
				.toList();
	}

	private List<MasterSmallCategoryResponse> getSmallCategories(String indsMclsCd) {
		List<MasterSmallCategoryResponse> smallCategories = new ArrayList<>();
		categoryMasterRepository.findByCategoryLevelAndParentCodeOrderByNameAsc(CategoryLevel.SMALL, indsMclsCd)
				.forEach(small -> smallCategories.add(new MasterSmallCategoryResponse(
						small.getCode(),
						small.getName())));
		return smallCategories;
	}
}
