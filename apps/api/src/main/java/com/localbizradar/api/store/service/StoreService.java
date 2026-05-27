package com.localbizradar.api.store.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.localbizradar.api.common.error.ResourceNotFoundException;
import com.localbizradar.api.common.response.PageResponse;
import com.localbizradar.api.master.service.MasterDataQueryService;
import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.dto.CategoryResponse;
import com.localbizradar.api.store.dto.MediumCategoryResponse;
import com.localbizradar.api.store.dto.SmallCategoryResponse;
import com.localbizradar.api.store.dto.StoreDetailResponse;
import com.localbizradar.api.store.dto.StoreListItemResponse;
import com.localbizradar.api.store.dto.StoreSearchRequest;
import com.localbizradar.api.store.repository.StoreRepository;
import com.localbizradar.api.store.repository.StoreSpecifications;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StoreService {

	private final StoreRepository storeRepository;
	private final MasterDataQueryService masterDataQueryService;

	public StoreService(
			StoreRepository storeRepository,
			MasterDataQueryService masterDataQueryService
	) {
		this.storeRepository = storeRepository;
		this.masterDataQueryService = masterDataQueryService;
	}

	public PageResponse<StoreListItemResponse> getStores(StoreSearchRequest request) {
		Page<StoreListItemResponse> stores = storeRepository
				.findAll(StoreSpecifications.bySearchRequest(request), request.toPageable())
				.map(StoreListItemResponse::from);

		return PageResponse.from(stores);
	}

	public StoreDetailResponse getStore(Long id) {
		Store store = storeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("점포를 찾을 수 없습니다."));

		return StoreDetailResponse.from(store);
	}

	public List<CategoryResponse> getCategories() {
		if (masterDataQueryService.hasCategoryMasters()) {
			return masterDataQueryService.getCompatibleCategories();
		}

		Map<String, CategoryGroup> categoryGroups = new LinkedHashMap<>();

		storeRepository.findCategoryRows().forEach(row -> {
			CategoryGroup categoryGroup = categoryGroups.computeIfAbsent(
					row.largeCode(),
					key -> new CategoryGroup(row.largeCode(), row.largeName()));
			MediumCategoryGroup mediumCategoryGroup = categoryGroup.mediumCategoryGroups.computeIfAbsent(
					row.mediumCode(),
					key -> new MediumCategoryGroup(row.mediumCode(), row.mediumName()));
			mediumCategoryGroup.smallCategories.add(new SmallCategoryResponse(row.smallCode(), row.smallName()));
		});

		return categoryGroups.values().stream()
				.map(CategoryGroup::toResponse)
				.toList();
	}

	private static class CategoryGroup {

		private final String largeCode;
		private final String largeName;
		private final Map<String, MediumCategoryGroup> mediumCategoryGroups = new LinkedHashMap<>();

		private CategoryGroup(String largeCode, String largeName) {
			this.largeCode = largeCode;
			this.largeName = largeName;
		}

		private CategoryResponse toResponse() {
			return new CategoryResponse(
					largeCode,
					largeName,
					mediumCategoryGroups.values().stream()
							.map(MediumCategoryGroup::toResponse)
							.toList());
		}
	}

	private static class MediumCategoryGroup {

		private final String mediumCode;
		private final String mediumName;
		private final List<SmallCategoryResponse> smallCategories = new ArrayList<>();

		private MediumCategoryGroup(String mediumCode, String mediumName) {
			this.mediumCode = mediumCode;
			this.mediumName = mediumName;
		}

		private MediumCategoryResponse toResponse() {
			return new MediumCategoryResponse(mediumCode, mediumName, smallCategories);
		}
	}
}
