package com.localbizradar.api.store.controller;

import java.util.List;

import jakarta.validation.Valid;

import com.localbizradar.api.common.response.PageResponse;
import com.localbizradar.api.store.dto.CategoryResponse;
import com.localbizradar.api.store.dto.StoreDetailResponse;
import com.localbizradar.api.store.dto.StoreListItemResponse;
import com.localbizradar.api.store.dto.StoreSearchRequest;
import com.localbizradar.api.store.service.StoreService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Stores", description = "점포 조회 API")
@RestController
@RequestMapping("/api/stores")
public class StoreController {

	private final StoreService storeService;

	public StoreController(StoreService storeService) {
		this.storeService = storeService;
	}

	@Operation(summary = "점포 목록 조회")
	@GetMapping
	public PageResponse<StoreListItemResponse> getStores(
			@Valid @ModelAttribute StoreSearchRequest request
	) {
		return storeService.getStores(request);
	}

	@Operation(summary = "점포 상세 조회")
	@GetMapping("/{id}")
	public StoreDetailResponse getStore(@PathVariable Long id) {
		return storeService.getStore(id);
	}

	@Operation(summary = "업종 필터 목록 조회")
	@GetMapping("/categories")
	public List<CategoryResponse> getCategories() {
		return storeService.getCategories();
	}
}
