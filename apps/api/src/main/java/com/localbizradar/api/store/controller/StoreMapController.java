package com.localbizradar.api.store.controller;

import java.util.List;

import jakarta.validation.Valid;

import com.localbizradar.api.store.dto.StoreMapItemResponse;
import com.localbizradar.api.store.dto.StoreMapRequest;
import com.localbizradar.api.store.dto.StoreNearbyItemResponse;
import com.localbizradar.api.store.dto.StoreNearbyRequest;
import com.localbizradar.api.store.service.StoreMapService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Store Map", description = "지도 기반 점포 조회 API")
@Validated
@RestController
@RequestMapping("/api/stores")
public class StoreMapController {

	private final StoreMapService storeMapService;

	public StoreMapController(StoreMapService storeMapService) {
		this.storeMapService = storeMapService;
	}

	@Operation(
			summary = "지도 marker 점포 조회",
			description = "지역, 업종, viewport 조건에 맞는 점포 marker 목록을 조회합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "지도 marker 점포 조회 성공"),
					@ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
			}
	)
	@GetMapping("/map")
	public List<StoreMapItemResponse> getMapStores(
			@Valid @ModelAttribute
			@Parameter(description = "지도 marker 조회 조건")
			StoreMapRequest request
	) {
		return storeMapService.getMapStores(request);
	}

	@Operation(
			summary = "반경 기반 주변 점포 조회",
			description = "입력 좌표와 반경을 기준으로 주변 점포를 Haversine 근사 계산으로 조회합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "주변 점포 조회 성공"),
					@ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
			}
	)
	@GetMapping("/nearby")
	public List<StoreNearbyItemResponse> getNearbyStores(
			@Valid @ModelAttribute
			@Parameter(description = "주변 점포 검색 조건")
			StoreNearbyRequest request
	) {
		return storeMapService.getNearbyStores(request);
	}
}
