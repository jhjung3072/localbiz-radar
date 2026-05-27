package com.localbizradar.api.master.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.localbizradar.api.common.error.BadRequestException;
import com.localbizradar.api.master.domain.CategoryLevel;
import com.localbizradar.api.master.domain.CategoryMaster;
import com.localbizradar.api.master.dto.CategoryMasterSyncRequest;
import com.localbizradar.api.master.dto.MasterSyncErrorResponse;
import com.localbizradar.api.master.dto.MasterSyncResponse;
import com.localbizradar.api.master.openapi.StoreMasterOpenApiClient;
import com.localbizradar.api.master.openapi.UpjongItem;
import com.localbizradar.api.master.repository.CategoryMasterRepository;
import com.localbizradar.api.sync.config.StoreSyncProperties;
import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class CategoryMasterSyncService {

	private static final String SOURCE_SYSTEM = "SMALL_BUSINESS_OPENAPI_MASTER";

	private final StoreMasterOpenApiClient storeMasterOpenApiClient;
	private final CategoryMasterRepository categoryMasterRepository;
	private final SyncLogRepository syncLogRepository;
	private final StoreSyncProperties storeSyncProperties;

	public CategoryMasterSyncService(
			StoreMasterOpenApiClient storeMasterOpenApiClient,
			CategoryMasterRepository categoryMasterRepository,
			SyncLogRepository syncLogRepository,
			StoreSyncProperties storeSyncProperties
	) {
		this.storeMasterOpenApiClient = storeMasterOpenApiClient;
		this.categoryMasterRepository = categoryMasterRepository;
		this.syncLogRepository = syncLogRepository;
		this.storeSyncProperties = storeSyncProperties;
	}

	public MasterSyncResponse syncCategories(CategoryMasterSyncRequest request) {
		LocalDateTime startedAt = LocalDateTime.now();
		SyncLog syncLog = syncLogRepository.save(SyncLog.start(
				SyncType.CATEGORY_MASTER_OPENAPI_SYNC,
				"OpenAPI 업종 코드 마스터",
				request.isDryRun(),
				startedAt));

		SyncCounters counters = new SyncCounters();
		List<MasterSyncErrorResponse> errors = new ArrayList<>();

		try {
			counters.requestedCount++;
			List<UpjongItem> largeItems = limit(
					storeMasterOpenApiClient.fetchLargeCategories().stream()
							.filter(item -> !StringUtils.hasText(request.getLargeCategoryCode())
									|| request.getLargeCategoryCode().equals(item.indsLclsCd()))
							.toList(),
					request.getMaxLargeCount());

			if (request.isIncludeLarge()) {
				for (UpjongItem large : largeItems) {
					processCategory(large, CategoryLevel.LARGE, request.isDryRun(), startedAt, counters, errors);
				}
			}

			if (request.isIncludeMedium() || request.isIncludeSmall()) {
				Set<String> largeCodes = largeItems.stream()
						.map(UpjongItem::indsLclsCd)
						.filter(StringUtils::hasText)
						.collect(java.util.stream.Collectors.toSet());

				counters.requestedCount++;
				List<UpjongItem> mediumItems = limit(
						storeMasterOpenApiClient.fetchMediumCategories(normalize(request.getLargeCategoryCode())).stream()
								.filter(item -> largeCodes.isEmpty() || largeCodes.contains(item.indsLclsCd()))
								.filter(item -> !StringUtils.hasText(request.getMediumCategoryCode())
										|| request.getMediumCategoryCode().equals(item.indsMclsCd()))
								.toList(),
						request.getMaxMediumCount());

				if (request.isIncludeMedium()) {
					for (UpjongItem medium : mediumItems) {
						processCategory(medium, CategoryLevel.MEDIUM, request.isDryRun(), startedAt, counters, errors);
					}
				}

				if (request.isIncludeSmall()) {
					syncSmallCategories(mediumItems, largeCodes, request, startedAt, counters, errors);
				}
			}

			return finish(syncLog, request.isDryRun(), counters, errors, "업종 코드 마스터 동기화가 완료되었습니다.");
		} catch (Exception exception) {
			String message = exception instanceof BadRequestException
					? exception.getMessage()
					: "업종 코드 마스터 동기화 중 오류가 발생했습니다.";
			errors.add(new MasterSyncErrorResponse("category-master", message));
			return finishFailed(syncLog, request.isDryRun(), counters, errors, message);
		}
	}

	private void syncSmallCategories(
			List<UpjongItem> mediumItems,
			Set<String> largeCodes,
			CategoryMasterSyncRequest request,
			LocalDateTime startedAt,
			SyncCounters counters,
			List<MasterSyncErrorResponse> errors
	) {
		Set<String> mediumCodes = mediumItems.stream()
				.map(UpjongItem::indsMclsCd)
				.filter(StringUtils::hasText)
				.collect(java.util.stream.Collectors.toSet());

		counters.requestedCount++;
		Map<String, Integer> smallCountByMediumCode = new HashMap<>();
		storeMasterOpenApiClient
				.fetchSmallCategories(normalize(request.getLargeCategoryCode()), normalize(request.getMediumCategoryCode()))
				.stream()
				.filter(item -> largeCodes.isEmpty() || largeCodes.contains(item.indsLclsCd()))
				.filter(item -> mediumCodes.isEmpty() || mediumCodes.contains(item.indsMclsCd()))
						.filter(item -> !StringUtils.hasText(request.getMediumCategoryCode())
								|| request.getMediumCategoryCode().equals(item.indsMclsCd()))
				.filter(item -> isWithinSmallLimit(item, request.getMaxSmallCountPerMedium(), smallCountByMediumCode))
				.forEach(item -> processCategory(
						item,
						CategoryLevel.SMALL,
						request.isDryRun(),
						startedAt,
						counters,
						errors));
	}

	private boolean isWithinSmallLimit(
			UpjongItem item,
			Integer maxSmallCountPerMedium,
			Map<String, Integer> smallCountByMediumCode
	) {
		if (maxSmallCountPerMedium == null) {
			return true;
		}
		String mediumCode = StringUtils.hasText(item.indsMclsCd()) ? item.indsMclsCd() : "unknown";
		int nextCount = smallCountByMediumCode.getOrDefault(mediumCode, 0) + 1;
		if (nextCount > maxSmallCountPerMedium) {
			return false;
		}
		smallCountByMediumCode.put(mediumCode, nextCount);
		return true;
	}

	private void processCategory(
			UpjongItem item,
			CategoryLevel level,
			boolean dryRun,
			LocalDateTime syncedAt,
			SyncCounters counters,
			List<MasterSyncErrorResponse> errors
	) {
		counters.fetchedRows++;
		ResolvedCategory resolved = resolveCategory(item, level);
		if (!StringUtils.hasText(resolved.code()) || !StringUtils.hasText(resolved.name())) {
			counters.failedRows++;
			errors.add(new MasterSyncErrorResponse(level.name(), "필수 업종 코드 또는 이름이 없습니다."));
			return;
		}
		if (dryRun) {
			counters.skippedRows++;
			return;
		}

		categoryMasterRepository.findByCategoryLevelAndCode(level, resolved.code())
				.ifPresentOrElse(
						master -> {
							master.update(
									item.indsLclsCd(),
									item.indsLclsNm(),
									item.indsMclsCd(),
									item.indsMclsNm(),
									item.indsSclsCd(),
									item.indsSclsNm(),
									resolved.parentCode(),
									resolved.name(),
									parseDate(item.stdrDt()),
									SOURCE_SYSTEM,
									syncedAt);
							counters.updatedRows++;
						},
						() -> {
							CategoryMaster master = CategoryMaster.create(
									level,
									item.indsLclsCd(),
									item.indsLclsNm(),
									item.indsMclsCd(),
									item.indsMclsNm(),
									item.indsSclsCd(),
									item.indsSclsNm(),
									resolved.parentCode(),
									resolved.code(),
									resolved.name(),
									parseDate(item.stdrDt()),
									SOURCE_SYSTEM,
									syncedAt);
							categoryMasterRepository.save(master);
							counters.insertedRows++;
						});
	}

	private ResolvedCategory resolveCategory(UpjongItem item, CategoryLevel level) {
		return switch (level) {
			case LARGE -> new ResolvedCategory(null, item.indsLclsCd(), item.indsLclsNm());
			case MEDIUM -> new ResolvedCategory(item.indsLclsCd(), item.indsMclsCd(), item.indsMclsNm());
			case SMALL -> new ResolvedCategory(item.indsMclsCd(), item.indsSclsCd(), item.indsSclsNm());
		};
	}

	private MasterSyncResponse finish(
			SyncLog syncLog,
			boolean dryRun,
			SyncCounters counters,
			List<MasterSyncErrorResponse> errors,
			String successMessage
	) {
		SyncStatus status = resolveStatus(counters);
		String message = status == SyncStatus.SUCCESS ? successMessage : "일부 업종 코드 row 처리에 실패했습니다.";
		return finishWithStatus(syncLog, dryRun, counters, errors, status, message);
	}

	private MasterSyncResponse finishFailed(
			SyncLog syncLog,
			boolean dryRun,
			SyncCounters counters,
			List<MasterSyncErrorResponse> errors,
			String message
	) {
		counters.failedRows++;
		return finishWithStatus(syncLog, dryRun, counters, errors, SyncStatus.FAILED, message);
	}

	private MasterSyncResponse finishWithStatus(
			SyncLog syncLog,
			boolean dryRun,
			SyncCounters counters,
			List<MasterSyncErrorResponse> errors,
			SyncStatus status,
			String message
	) {
		LocalDateTime finishedAt = LocalDateTime.now();
		syncLog.finish(
				status,
				counters.fetchedRows,
				counters.successRows(),
				counters.failedRows,
				counters.skippedRows,
				message,
				buildErrorSummary(errors),
				finishedAt);

		return new MasterSyncResponse(
				syncLog.getId(),
				status,
				dryRun,
				SyncType.CATEGORY_MASTER_OPENAPI_SYNC,
				counters.requestedCount,
				counters.fetchedRows,
				counters.insertedRows,
				counters.updatedRows,
				counters.skippedRows,
				counters.failedRows,
				message,
				limitErrors(errors));
	}

	private SyncStatus resolveStatus(SyncCounters counters) {
		if (counters.failedRows == 0) {
			return SyncStatus.SUCCESS;
		}
		if (counters.successRows() > 0) {
			return SyncStatus.PARTIAL_SUCCESS;
		}
		return SyncStatus.FAILED;
	}

	private <T> List<T> limit(List<T> values, Integer maxCount) {
		if (maxCount == null || values.size() <= maxCount) {
			return values;
		}
		return values.stream().limit(maxCount).toList();
	}

	private String normalize(String value) {
		return StringUtils.hasText(value) ? value.trim() : null;
	}

	private LocalDate parseDate(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		String trimmed = value.trim();
		List<DateTimeFormatter> formatters = List.of(
				DateTimeFormatter.BASIC_ISO_DATE,
				DateTimeFormatter.ISO_LOCAL_DATE,
				DateTimeFormatter.ofPattern("yyyyMM"));
		for (DateTimeFormatter formatter : formatters) {
			try {
				if (trimmed.length() == 6) {
					return LocalDate.parse(trimmed + "01", DateTimeFormatter.BASIC_ISO_DATE);
				}
				return LocalDate.parse(trimmed, formatter);
			} catch (DateTimeParseException ignored) {
			}
		}
		return null;
	}

	private String buildErrorSummary(List<MasterSyncErrorResponse> errors) {
		if (errors.isEmpty()) {
			return null;
		}
		return limitErrors(errors).stream()
				.map(error -> error.scope() + ": " + error.message())
				.reduce((left, right) -> left + "\n" + right)
				.orElse(null);
	}

	private List<MasterSyncErrorResponse> limitErrors(List<MasterSyncErrorResponse> errors) {
		return errors.stream()
				.limit(storeSyncProperties.maxErrorSummaryCount())
				.toList();
	}

	private record ResolvedCategory(String parentCode, String code, String name) {
	}

	private static class SyncCounters {

		private int requestedCount;
		private int fetchedRows;
		private int insertedRows;
		private int updatedRows;
		private int skippedRows;
		private int failedRows;

		private int successRows() {
			return insertedRows + updatedRows + skippedRows;
		}
	}
}
