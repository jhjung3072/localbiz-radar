package com.localbizradar.api.sync.service;

import java.time.LocalDateTime;
import java.util.List;

import com.localbizradar.api.common.error.BadRequestException;
import com.localbizradar.api.sync.config.StoreSyncProperties;
import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;
import com.localbizradar.api.sync.dto.StoreCsvImportResponse;
import com.localbizradar.api.sync.dto.StoreCsvRowErrorResponse;
import com.localbizradar.api.sync.mapper.StoreCsvMapper;
import com.localbizradar.api.sync.parser.StoreCsvParseError;
import com.localbizradar.api.sync.parser.StoreCsvParseResult;
import com.localbizradar.api.sync.parser.StoreCsvParser;
import com.localbizradar.api.sync.parser.StoreCsvRow;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class StoreCsvImportService {

	private final StoreCsvParser storeCsvParser;
	private final StoreCsvMapper storeCsvMapper;
	private final StoreUpsertService storeUpsertService;
	private final SyncLogRepository syncLogRepository;
	private final StoreSyncProperties properties;

	public StoreCsvImportService(
			StoreCsvParser storeCsvParser,
			StoreCsvMapper storeCsvMapper,
			StoreUpsertService storeUpsertService,
			SyncLogRepository syncLogRepository,
			StoreSyncProperties properties
	) {
		this.storeCsvParser = storeCsvParser;
		this.storeCsvMapper = storeCsvMapper;
		this.storeUpsertService = storeUpsertService;
		this.syncLogRepository = syncLogRepository;
		this.properties = properties;
	}

	public StoreCsvImportResponse importStores(MultipartFile file, boolean dryRun) {
		validateFile(file);

		LocalDateTime startedAt = LocalDateTime.now();
		String sourceName = normalizeSourceName(file.getOriginalFilename());
		SyncLog syncLog = syncLogRepository.save(SyncLog.start(
				SyncType.STORE_CSV_IMPORT,
				sourceName,
				dryRun,
				startedAt));

		try {
			StoreCsvParseResult parseResult = storeCsvParser.parse(
					file.getInputStream(),
					properties.maxRowsPerImport(),
					properties.failFast());
			int successRows = dryRun ? parseResult.rows().size() : upsertRows(parseResult.rows(), startedAt);
			int failedRows = parseResult.errors().size();
			SyncStatus status = resolveStatus(successRows, failedRows);
			String message = buildMessage(status, dryRun, successRows, failedRows);
			String errorSummary = buildErrorSummary(parseResult.errors());
			LocalDateTime finishedAt = LocalDateTime.now();

			syncLog.finish(
					status,
					parseResult.totalRows(),
					successRows,
					failedRows,
					0,
					message,
					errorSummary,
					finishedAt);

			return new StoreCsvImportResponse(
					syncLog.getId(),
					status,
					dryRun,
					parseResult.totalRows(),
					successRows,
					failedRows,
					0,
					message,
					toErrorResponses(parseResult.errors()));
		} catch (BadRequestException exception) {
			LocalDateTime finishedAt = LocalDateTime.now();
			syncLog.finish(
					SyncStatus.FAILED,
					0,
					0,
					1,
					0,
					exception.getMessage(),
					exception.getMessage(),
					finishedAt);

			return new StoreCsvImportResponse(
					syncLog.getId(),
					SyncStatus.FAILED,
					dryRun,
					0,
					0,
					1,
					0,
					exception.getMessage(),
					List.of(new StoreCsvRowErrorResponse(0, exception.getMessage())));
		} catch (Exception exception) {
			LocalDateTime finishedAt = LocalDateTime.now();
			syncLog.finish(
					SyncStatus.FAILED,
					0,
					0,
					1,
					0,
					"CSV import 중 오류가 발생했습니다.",
					exception.getMessage(),
					finishedAt);
			return new StoreCsvImportResponse(
					syncLog.getId(),
					SyncStatus.FAILED,
					dryRun,
					0,
					0,
					1,
					0,
					"CSV import 중 오류가 발생했습니다.",
					List.of(new StoreCsvRowErrorResponse(0, "CSV import 중 오류가 발생했습니다.")));
		}
	}

	private int upsertRows(List<StoreCsvRow> rows, LocalDateTime syncedAt) {
		String sourceSystem = properties.defaultSourceSystem();
		for (StoreCsvRow row : rows) {
			storeUpsertService.upsert(storeCsvMapper.toCommand(row, sourceSystem), syncedAt);
		}
		return rows.size();
	}

	private void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BadRequestException("업로드할 CSV 파일을 선택해 주세요.");
		}
		if (file.getSize() > properties.maxFileSizeBytes()) {
			throw new BadRequestException("CSV 파일 크기가 최대 허용치를 초과했습니다.");
		}
		String filename = file.getOriginalFilename();
		String extension = StringUtils.getFilenameExtension(filename);
		if (!"csv".equalsIgnoreCase(extension)) {
			throw new BadRequestException("csv 확장자 파일만 업로드할 수 있습니다.");
		}
	}

	private String normalizeSourceName(String originalFilename) {
		String sourceName = StringUtils.hasText(originalFilename) ? originalFilename.trim() : "uploaded-store.csv";
		if (sourceName.length() <= 255) {
			return sourceName;
		}
		return sourceName.substring(0, 255);
	}

	private SyncStatus resolveStatus(int successRows, int failedRows) {
		if (successRows > 0 && failedRows == 0) {
			return SyncStatus.SUCCESS;
		}
		if (successRows > 0) {
			return SyncStatus.PARTIAL_SUCCESS;
		}
		return SyncStatus.FAILED;
	}

	private String buildMessage(SyncStatus status, boolean dryRun, int successRows, int failedRows) {
		if (status == SyncStatus.SUCCESS) {
			return dryRun ? "검증이 완료되었습니다. 실제 반영은 수행하지 않았습니다." : "CSV import가 완료되었습니다.";
		}
		if (status == SyncStatus.PARTIAL_SUCCESS) {
			return "일부 row가 실패했지만 " + successRows + "개 row를 처리했습니다.";
		}
		if (failedRows > 0) {
			return "처리 가능한 row가 없습니다. 실패 row를 확인해 주세요.";
		}
		return "CSV import 결과가 없습니다.";
	}

	private String buildErrorSummary(List<StoreCsvParseError> errors) {
		if (errors.isEmpty()) {
			return null;
		}
		return errors.stream()
				.limit(properties.maxErrorSummaryCount())
				.map(error -> "row " + error.rowNumber() + ": " + error.message())
				.reduce((left, right) -> left + "\n" + right)
				.orElse(null);
	}

	private List<StoreCsvRowErrorResponse> toErrorResponses(List<StoreCsvParseError> errors) {
		return errors.stream()
				.limit(properties.maxErrorSummaryCount())
				.map(StoreCsvRowErrorResponse::from)
				.toList();
	}
}
