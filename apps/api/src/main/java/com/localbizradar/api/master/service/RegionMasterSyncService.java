package com.localbizradar.api.master.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import com.localbizradar.api.common.error.BadRequestException;
import com.localbizradar.api.master.domain.RegionMaster;
import com.localbizradar.api.master.domain.RegionType;
import com.localbizradar.api.master.dto.MasterSyncErrorResponse;
import com.localbizradar.api.master.dto.MasterSyncResponse;
import com.localbizradar.api.master.dto.RegionMasterSyncRequest;
import com.localbizradar.api.master.openapi.BaroApiItem;
import com.localbizradar.api.master.openapi.StoreMasterOpenApiClient;
import com.localbizradar.api.master.repository.RegionMasterRepository;
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
public class RegionMasterSyncService {

	private static final String SOURCE_SYSTEM = "SMALL_BUSINESS_OPENAPI_MASTER";

	private final StoreMasterOpenApiClient storeMasterOpenApiClient;
	private final RegionMasterRepository regionMasterRepository;
	private final SyncLogRepository syncLogRepository;
	private final StoreSyncProperties storeSyncProperties;

	public RegionMasterSyncService(
			StoreMasterOpenApiClient storeMasterOpenApiClient,
			RegionMasterRepository regionMasterRepository,
			SyncLogRepository syncLogRepository,
			StoreSyncProperties storeSyncProperties
	) {
		this.storeMasterOpenApiClient = storeMasterOpenApiClient;
		this.regionMasterRepository = regionMasterRepository;
		this.syncLogRepository = syncLogRepository;
		this.storeSyncProperties = storeSyncProperties;
	}

	public MasterSyncResponse syncRegions(RegionMasterSyncRequest request) {
		LocalDateTime startedAt = LocalDateTime.now();
		SyncLog syncLog = syncLogRepository.save(SyncLog.start(
				SyncType.REGION_MASTER_OPENAPI_SYNC,
				"OpenAPI 행정구역 코드 마스터",
				request.isDryRun(),
				startedAt));

		SyncCounters counters = new SyncCounters();
		List<MasterSyncErrorResponse> errors = new ArrayList<>();

		try {
			counters.requestedCount++;
			List<BaroApiItem> sidoItems = storeMasterOpenApiClient.fetchSidoList().stream()
					.filter(item -> !StringUtils.hasText(request.getCtprvnCd())
							|| request.getCtprvnCd().equals(item.ctprvnCd()))
					.toList();

			for (BaroApiItem item : sidoItems) {
				processRegion(item, RegionType.SIDO, request.isDryRun(), startedAt, counters, errors);
			}

			if (request.isIncludeSigungu()) {
				for (BaroApiItem sido : sidoItems) {
					syncSigunguAndDong(sido, request, startedAt, counters, errors);
				}
			}

			return finish(syncLog, request.isDryRun(), counters, errors, "행정구역 코드 마스터 동기화가 완료되었습니다.");
		} catch (Exception exception) {
			String message = exception instanceof BadRequestException
					? exception.getMessage()
					: "행정구역 코드 마스터 동기화 중 오류가 발생했습니다.";
			errors.add(new MasterSyncErrorResponse("region-master", message));
			return finishFailed(syncLog, request.isDryRun(), counters, errors, message);
		}
	}

	private void syncSigunguAndDong(
			BaroApiItem sido,
			RegionMasterSyncRequest request,
			LocalDateTime startedAt,
			SyncCounters counters,
			List<MasterSyncErrorResponse> errors
	) {
		counters.requestedCount++;
		List<BaroApiItem> sigunguItems = limit(
				storeMasterOpenApiClient.fetchSigunguList(sido.ctprvnCd()),
				request.getMaxSigunguCount());

		for (BaroApiItem sigungu : sigunguItems) {
			processRegion(sigungu, RegionType.SIGUNGU, request.isDryRun(), startedAt, counters, errors);
			if (request.isIncludeAdminDong()) {
				counters.requestedCount++;
				limit(storeMasterOpenApiClient.fetchAdminDongList(sigungu.signguCd()), request.getMaxDongCountPerSigungu())
						.forEach(item -> processRegion(
								item,
								RegionType.ADMIN_DONG,
								request.isDryRun(),
								startedAt,
								counters,
								errors));
			}
			if (request.isIncludeLegalDong()) {
				counters.requestedCount++;
				limit(storeMasterOpenApiClient.fetchLegalDongList(sigungu.signguCd()), request.getMaxDongCountPerSigungu())
						.forEach(item -> processRegion(
								item,
								RegionType.LEGAL_DONG,
								request.isDryRun(),
								startedAt,
								counters,
								errors));
			}
		}
	}

	private void processRegion(
			BaroApiItem item,
			RegionType regionType,
			boolean dryRun,
			LocalDateTime syncedAt,
			SyncCounters counters,
			List<MasterSyncErrorResponse> errors
	) {
		counters.fetchedRows++;
		ResolvedRegion resolved = resolveRegion(item, regionType);
		if (!StringUtils.hasText(resolved.code()) || !StringUtils.hasText(resolved.name())) {
			counters.failedRows++;
			errors.add(new MasterSyncErrorResponse(regionType.name(), "필수 행정구역 코드 또는 이름이 없습니다."));
			return;
		}
		if (dryRun) {
			counters.skippedRows++;
			return;
		}

		regionMasterRepository.findByRegionTypeAndCode(regionType, resolved.code())
				.ifPresentOrElse(
						master -> {
							master.update(
									item.ctprvnCd(),
									item.ctprvnNm(),
									item.signguCd(),
									item.signguNm(),
									item.adongCd(),
									item.adongNm(),
									item.ldongCd(),
									item.ldongNm(),
									resolved.parentCode(),
									resolved.name(),
									parseDate(item.stdrDt()),
									SOURCE_SYSTEM,
									syncedAt);
							counters.updatedRows++;
						},
						() -> {
							RegionMaster master = RegionMaster.create(
									regionType,
									item.ctprvnCd(),
									item.ctprvnNm(),
									item.signguCd(),
									item.signguNm(),
									item.adongCd(),
									item.adongNm(),
									item.ldongCd(),
									item.ldongNm(),
									resolved.parentCode(),
									resolved.code(),
									resolved.name(),
									parseDate(item.stdrDt()),
									SOURCE_SYSTEM,
									syncedAt);
							regionMasterRepository.save(master);
							counters.insertedRows++;
						});
	}

	private ResolvedRegion resolveRegion(BaroApiItem item, RegionType regionType) {
		return switch (regionType) {
			case SIDO -> new ResolvedRegion(null, item.ctprvnCd(), item.ctprvnNm());
			case SIGUNGU -> new ResolvedRegion(item.ctprvnCd(), item.signguCd(), item.signguNm());
			case ADMIN_DONG -> new ResolvedRegion(item.signguCd(), item.adongCd(), item.adongNm());
			case LEGAL_DONG -> new ResolvedRegion(item.signguCd(), item.ldongCd(), item.ldongNm());
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
		String message = status == SyncStatus.SUCCESS ? successMessage : "일부 행정구역 코드 row 처리에 실패했습니다.";
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
				SyncType.REGION_MASTER_OPENAPI_SYNC,
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

	private record ResolvedRegion(String parentCode, String code, String name) {
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
