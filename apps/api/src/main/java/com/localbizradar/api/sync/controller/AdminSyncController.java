package com.localbizradar.api.sync.controller;

import jakarta.validation.Valid;

import com.localbizradar.api.common.response.PageResponse;
import com.localbizradar.api.sync.dto.StoreCsvImportResponse;
import com.localbizradar.api.sync.dto.SyncLogDetailResponse;
import com.localbizradar.api.sync.dto.SyncLogListItemResponse;
import com.localbizradar.api.sync.dto.SyncLogSearchRequest;
import com.localbizradar.api.sync.service.StoreCsvImportService;
import com.localbizradar.api.sync.service.SyncLogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Admin Sync", description = "개발용 데이터 동기화 API")
@Validated
@RestController
@RequestMapping("/api/admin/sync")
public class AdminSyncController {

	private final StoreCsvImportService storeCsvImportService;
	private final SyncLogService syncLogService;

	public AdminSyncController(
			StoreCsvImportService storeCsvImportService,
			SyncLogService syncLogService
	) {
		this.storeCsvImportService = storeCsvImportService;
		this.syncLogService = syncLogService;
	}

	@Operation(
			summary = "소상공인 상가정보 CSV import",
			description = "CSV 파일을 업로드해 stores table에 upsert하거나 dry-run으로 검증합니다.",
			responses = {
					@ApiResponse(responseCode = "200", description = "CSV import 요청 처리 완료"),
					@ApiResponse(responseCode = "400", description = "잘못된 업로드 요청")
			}
	)
	@PostMapping(value = "/stores/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public StoreCsvImportResponse importStoreCsv(
			@Parameter(description = "소상공인 상가정보 CSV 파일")
			@RequestPart("file") MultipartFile file,
			@Parameter(description = "true이면 DB 저장 없이 검증만 실행합니다.")
			@RequestParam(defaultValue = "true") boolean dryRun
	) {
		return storeCsvImportService.importStores(file, dryRun);
	}

	@Operation(summary = "동기화 이력 목록 조회")
	@GetMapping("/logs")
	public PageResponse<SyncLogListItemResponse> getSyncLogs(
			@Valid @ModelAttribute SyncLogSearchRequest request
	) {
		return syncLogService.getSyncLogs(request);
	}

	@Operation(summary = "동기화 이력 상세 조회")
	@GetMapping("/logs/{id}")
	public SyncLogDetailResponse getSyncLog(@PathVariable Long id) {
		return syncLogService.getSyncLog(id);
	}
}
