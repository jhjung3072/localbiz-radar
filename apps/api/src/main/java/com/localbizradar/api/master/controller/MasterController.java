package com.localbizradar.api.master.controller;

import java.util.List;

import com.localbizradar.api.master.dto.MasterCategoryResponse;
import com.localbizradar.api.master.dto.MasterRegionResponse;
import com.localbizradar.api.master.service.MasterDataQueryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Master Data", description = "행정구역/업종 코드 마스터 조회 API")
@Validated
@RestController
@RequestMapping("/api/master")
public class MasterController {

	private final MasterDataQueryService masterDataQueryService;

	public MasterController(MasterDataQueryService masterDataQueryService) {
		this.masterDataQueryService = masterDataQueryService;
	}

	@Operation(summary = "행정구역 마스터 조회", description = "시도/시군구/행정동 계층형 필터 데이터를 조회합니다.")
	@GetMapping("/regions")
	public List<MasterRegionResponse> getRegions(
			@Parameter(description = "행정동 포함 여부")
			@RequestParam(defaultValue = "true") boolean includeAdminDong,
			@Parameter(description = "법정동 포함 여부")
			@RequestParam(defaultValue = "false") boolean includeLegalDong,
			@Parameter(description = "시도 코드")
			@RequestParam(required = false) String ctprvnCd,
			@Parameter(description = "시군구 코드")
			@RequestParam(required = false) String signguCd
	) {
		return masterDataQueryService.getRegions(includeAdminDong, includeLegalDong, ctprvnCd, signguCd);
	}

	@Operation(summary = "업종 마스터 조회", description = "대/중/소분류 업종 계층형 필터 데이터를 조회합니다.")
	@GetMapping("/categories")
	public List<MasterCategoryResponse> getCategories(
			@Parameter(description = "업종 대분류 코드")
			@RequestParam(required = false) String indsLclsCd,
			@Parameter(description = "업종 중분류 코드")
			@RequestParam(required = false) String indsMclsCd
	) {
		return masterDataQueryService.getCategories(indsLclsCd, indsMclsCd);
	}
}
