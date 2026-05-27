package com.localbizradar.api.region.controller;

import java.util.List;

import com.localbizradar.api.region.dto.RegionResponse;
import com.localbizradar.api.region.service.RegionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Regions", description = "지역 필터 조회 API")
@RestController
@RequestMapping("/api/regions")
public class RegionController {

	private final RegionService regionService;

	public RegionController(RegionService regionService) {
		this.regionService = regionService;
	}

	@Operation(summary = "지역 필터 목록 조회")
	@GetMapping
	public List<RegionResponse> getRegions() {
		return regionService.getRegions();
	}
}
