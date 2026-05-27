package com.localbizradar.api.master.controller;

import jakarta.validation.Valid;

import com.localbizradar.api.master.dto.CategoryMasterSyncRequest;
import com.localbizradar.api.master.dto.MasterDataStatusResponse;
import com.localbizradar.api.master.dto.MasterSyncResponse;
import com.localbizradar.api.master.dto.RegionMasterSyncRequest;
import com.localbizradar.api.master.service.CategoryMasterSyncService;
import com.localbizradar.api.master.service.MasterDataQueryService;
import com.localbizradar.api.master.service.RegionMasterSyncService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Master Sync", description = "개발용 코드 마스터 OpenAPI 동기화 API")
@Validated
@RestController
@RequestMapping("/api/admin/sync/master")
public class AdminMasterSyncController {

	private final RegionMasterSyncService regionMasterSyncService;
	private final CategoryMasterSyncService categoryMasterSyncService;
	private final MasterDataQueryService masterDataQueryService;

	public AdminMasterSyncController(
			RegionMasterSyncService regionMasterSyncService,
			CategoryMasterSyncService categoryMasterSyncService,
			MasterDataQueryService masterDataQueryService
	) {
		this.regionMasterSyncService = regionMasterSyncService;
		this.categoryMasterSyncService = categoryMasterSyncService;
		this.masterDataQueryService = masterDataQueryService;
	}

	@Operation(
			summary = "행정구역 코드 마스터 OpenAPI 동기화",
			description = "baroApi 기반으로 행정구역 코드 마스터를 dry-run 또는 실제 반영합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "행정구역 마스터 동기화 처리 완료"),
					@ApiResponse(responseCode = "400", description = "OpenAPI 설정 또는 요청값 오류")
			}
	)
	@PostMapping("/regions/openapi")
	public MasterSyncResponse syncRegionMasters(
			@Valid @RequestBody RegionMasterSyncRequest request
	) {
		return regionMasterSyncService.syncRegions(request);
	}

	@Operation(
			summary = "업종 코드 마스터 OpenAPI 동기화",
			description = "largeUpjongList/middleUpjongList/smallUpjongList 기반으로 업종 코드를 동기화합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "업종 마스터 동기화 처리 완료"),
					@ApiResponse(responseCode = "400", description = "OpenAPI 설정 또는 요청값 오류")
			}
	)
	@PostMapping("/categories/openapi")
	public MasterSyncResponse syncCategoryMasters(
			@Valid @RequestBody CategoryMasterSyncRequest request
	) {
		return categoryMasterSyncService.syncCategories(request);
	}

	@Operation(summary = "마스터 데이터 동기화 상태 조회")
	@GetMapping("/status")
	public MasterDataStatusResponse getMasterDataStatus() {
		return masterDataQueryService.getStatus();
	}
}
