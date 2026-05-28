package com.localbizradar.api.analysis.controller;

import java.util.List;

import jakarta.validation.Valid;

import com.localbizradar.api.analysis.dto.AnalysisSummaryRequest;
import com.localbizradar.api.analysis.dto.AnalysisSummaryResponse;
import com.localbizradar.api.analysis.dto.CategoryDistributionItemResponse;
import com.localbizradar.api.analysis.dto.CategoryDistributionRequest;
import com.localbizradar.api.analysis.dto.CompareAnalysisRequest;
import com.localbizradar.api.analysis.dto.CompareAnalysisResponse;
import com.localbizradar.api.analysis.dto.CompetitionRequest;
import com.localbizradar.api.analysis.dto.CompetitionResponse;
import com.localbizradar.api.analysis.dto.RegionRankingItemResponse;
import com.localbizradar.api.analysis.dto.RegionRankingRequest;
import com.localbizradar.api.analysis.service.AnalysisService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Analysis", description = "상권 분석 API")
@Validated
@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

	private final AnalysisService analysisService;

	public AnalysisController(AnalysisService analysisService) {
		this.analysisService = analysisService;
	}

	@Operation(
			summary = "분석 요약 지표 조회",
			description = "현재 stores seed data를 기반으로 총 점포 수, 경쟁 지수, 다양성 점수, LocalBiz 점수를 계산합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "분석 요약 지표 조회 성공"),
					@ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
			}
	)
	@GetMapping("/summary")
	public AnalysisSummaryResponse getSummary(
			@Valid @ModelAttribute
			@Parameter(description = "지역 및 업종 필터")
			AnalysisSummaryRequest request
	) {
		return analysisService.getSummary(request);
	}

	@Operation(
			summary = "업종 분포 조회",
			description = "지역 조건과 업종 depth에 따라 점포 수와 비율을 반환합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "업종 분포 조회 성공"),
					@ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
			}
	)
	@GetMapping("/category-distribution")
	public List<CategoryDistributionItemResponse> getCategoryDistribution(
			@Valid @ModelAttribute
			@Parameter(description = "지역 필터와 업종 depth")
			CategoryDistributionRequest request
	) {
		return analysisService.getCategoryDistribution(request);
	}

	@Operation(
			summary = "경쟁 점포 수 조회",
			description = "지역 또는 좌표 반경 조건을 기준으로 경쟁 점포 수와 경쟁 지수를 계산합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "경쟁 점포 수 조회 성공"),
					@ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
			}
	)
	@GetMapping("/competition")
	public CompetitionResponse getCompetition(
			@Valid @ModelAttribute
			@Parameter(description = "지역, 업종, 좌표 반경 필터")
			CompetitionRequest request
	) {
		return analysisService.getCompetition(request);
	}

	@Operation(
			summary = "후보 지역 비교",
			description = "두 후보 지역의 seed data 기반 분석 지표를 비교합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "후보 지역 비교 성공"),
					@ApiResponse(responseCode = "400", description = "잘못된 요청 본문")
			}
	)
	@PostMapping("/compare")
	public CompareAnalysisResponse compare(
			@Valid @RequestBody CompareAnalysisRequest request
	) {
		return analysisService.compare(request);
	}

	@Operation(
			summary = "지역별 후보 랭킹 조회",
			description = "선택 업종 기준으로 시군구 또는 행정동별 LocalBiz 점수 랭킹을 반환합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "지역 랭킹 조회 성공"),
					@ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
			}
	)
	@GetMapping("/region-ranking")
	public List<RegionRankingItemResponse> getRegionRanking(
			@Valid @ModelAttribute
			@Parameter(description = "지역 랭킹 필터")
			RegionRankingRequest request
	) {
		return analysisService.getRegionRanking(request);
	}
}
