package com.localbizradar.api.ops.controller;

import com.localbizradar.api.ops.dto.OpsDataQualityResponse;
import com.localbizradar.api.ops.dto.OpsOverviewResponse;
import com.localbizradar.api.ops.dto.OpsSyncSummaryResponse;
import com.localbizradar.api.ops.service.OpsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Operations", description = "관리자 운영 상태와 데이터 품질 조회 API")
@Validated
@RestController
@RequestMapping("/api/admin/ops")
public class AdminOpsController {

	private final OpsService opsService;

	public AdminOpsController(OpsService opsService) {
		this.opsService = opsService;
	}

	@Operation(summary = "운영 대시보드 요약", description = "서비스 상태, 데이터 요약, 최근 동기화 상태를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "운영 요약 조회 성공")
	@GetMapping("/overview")
	public OpsOverviewResponse getOverview() {
		return opsService.getOverview();
	}

	@Operation(summary = "동기화 요약", description = "최근 N일 동기화 실행 결과와 실패 이력을 조회합니다.")
	@ApiResponse(responseCode = "200", description = "동기화 요약 조회 성공")
	@GetMapping("/sync-summary")
	public OpsSyncSummaryResponse getSyncSummary(
			@Parameter(description = "조회 기간. 1일부터 30일까지 허용합니다.")
			@RequestParam(defaultValue = "7") @Min(1) @Max(30) int days
	) {
		return opsService.getSyncSummary(days);
	}

	@Operation(summary = "데이터 품질 요약", description = "점포 좌표, 주소, 업종 누락 현황과 보유율을 조회합니다.")
	@ApiResponse(responseCode = "200", description = "데이터 품질 조회 성공")
	@GetMapping("/data-quality")
	public OpsDataQualityResponse getDataQuality() {
		return opsService.getDataQuality();
	}
}
