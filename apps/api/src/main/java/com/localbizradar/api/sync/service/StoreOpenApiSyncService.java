package com.localbizradar.api.sync.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.localbizradar.api.common.error.BadRequestException;
import com.localbizradar.api.region.domain.Region;
import com.localbizradar.api.region.repository.RegionRepository;
import com.localbizradar.api.sync.config.StoreOpenApiProperties;
import com.localbizradar.api.sync.config.StoreSyncProperties;
import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;
import com.localbizradar.api.sync.dto.StoreOpenApiRowErrorResponse;
import com.localbizradar.api.sync.dto.StoreOpenApiScheduleRequest;
import com.localbizradar.api.sync.dto.StoreOpenApiStatusResponse;
import com.localbizradar.api.sync.dto.StoreOpenApiSyncRequest;
import com.localbizradar.api.sync.dto.StoreOpenApiSyncResponse;
import com.localbizradar.api.sync.openapi.client.StoreOpenApiClient;
import com.localbizradar.api.sync.openapi.dto.StoreOpenApiPage;
import com.localbizradar.api.sync.openapi.dto.StoreOpenApiRequest;
import com.localbizradar.api.sync.openapi.mapper.StoreOpenApiMapResult;
import com.localbizradar.api.sync.openapi.mapper.StoreOpenApiMapper;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class StoreOpenApiSyncService {

	private final StoreOpenApiClient storeOpenApiClient;
	private final StoreOpenApiMapper storeOpenApiMapper;
	private final StoreUpsertService storeUpsertService;
	private final SyncLogRepository syncLogRepository;
	private final RegionRepository regionRepository;
	private final StoreOpenApiProperties properties;
	private final StoreSyncProperties storeSyncProperties;
	private final StoreOpenApiScheduleService scheduleService;

	public StoreOpenApiSyncService(
			StoreOpenApiClient storeOpenApiClient,
			StoreOpenApiMapper storeOpenApiMapper,
			StoreUpsertService storeUpsertService,
			SyncLogRepository syncLogRepository,
			RegionRepository regionRepository,
			StoreOpenApiProperties properties,
			StoreSyncProperties storeSyncProperties,
			StoreOpenApiScheduleService scheduleService
	) {
		this.storeOpenApiClient = storeOpenApiClient;
		this.storeOpenApiMapper = storeOpenApiMapper;
		this.storeUpsertService = storeUpsertService;
		this.syncLogRepository = syncLogRepository;
		this.regionRepository = regionRepository;
		this.properties = properties;
		this.storeSyncProperties = storeSyncProperties;
		this.scheduleService = scheduleService;
	}

	public StoreOpenApiSyncResponse syncStores(StoreOpenApiSyncRequest request) {
		validateConfiguration();

		ResolvedRequest resolvedRequest = resolveRequest(request);
		LocalDateTime startedAt = LocalDateTime.now();
		SyncLog syncLog = syncLogRepository.save(SyncLog.start(
				SyncType.STORE_OPENAPI_SYNC,
				buildSourceName(resolvedRequest),
				resolvedRequest.dryRun(),
				startedAt));

		List<StoreOpenApiRowErrorResponse> errors = new ArrayList<>();
		int requestedPages = 0;
		int fetchedRows = 0;
		int successRows = 0;
		int insertedRows = 0;
		int updatedRows = 0;

		try {
			for (int pageOffset = 0; pageOffset < resolvedRequest.maxPages(); pageOffset++) {
				int pageNo = resolvedRequest.pageNo() + pageOffset;
				requestedPages++;
				StoreOpenApiPage page = storeOpenApiClient.fetchStores(buildOpenApiRequest(resolvedRequest, pageNo));

				fetchedRows += page.items().size();
				int rowNumber = 0;
				for (com.localbizradar.api.sync.openapi.dto.StoreOpenApiItem item : page.items()) {
					rowNumber++;
					StoreOpenApiMapResult mapResult = storeOpenApiMapper.toCommand(item, properties.defaultSourceSystem());
					if (!mapResult.valid()) {
						errors.add(new StoreOpenApiRowErrorResponse(pageNo, rowNumber, mapResult.errorMessage()));
						continue;
					}

					successRows++;
					if (!resolvedRequest.dryRun()) {
						StoreUpsertResult upsertResult = storeUpsertService.upsert(mapResult.command(), startedAt);
						if (upsertResult.inserted()) {
							insertedRows++;
						} else {
							updatedRows++;
						}
					}
				}

				if (page.items().isEmpty()) {
					break;
				}
				if (page.totalCount() > 0 && pageNo * resolvedRequest.pageSize() >= page.totalCount()) {
					break;
				}
			}

			int failedRows = errors.size();
			SyncStatus status = resolveStatus(successRows, failedRows);
			String message = buildMessage(status, resolvedRequest.dryRun(), fetchedRows, successRows, failedRows);
			String errorSummary = buildErrorSummary(errors);
			LocalDateTime finishedAt = LocalDateTime.now();

			syncLog.finish(
					status,
					fetchedRows,
					successRows,
					failedRows,
					0,
					message,
					errorSummary,
					finishedAt);

			return new StoreOpenApiSyncResponse(
					syncLog.getId(),
					status,
					resolvedRequest.dryRun(),
					requestedPages,
					fetchedRows,
					successRows,
					failedRows,
					0,
					insertedRows,
					updatedRows,
					message,
					limitErrors(errors));
		} catch (Exception exception) {
			LocalDateTime finishedAt = LocalDateTime.now();
			String message = exception instanceof BadRequestException
					? exception.getMessage()
					: "OpenAPI 동기화 중 오류가 발생했습니다.";
			syncLog.finish(
					SyncStatus.FAILED,
					fetchedRows,
					successRows,
					errors.size() + 1,
					0,
					message,
					message,
					finishedAt);

			return new StoreOpenApiSyncResponse(
					syncLog.getId(),
					SyncStatus.FAILED,
					resolvedRequest.dryRun(),
					requestedPages,
					fetchedRows,
					successRows,
					errors.size() + 1,
					0,
					insertedRows,
					updatedRows,
					message,
					limitErrors(appendError(errors, requestedPages, message)));
		}
	}

	@Transactional(readOnly = true)
	public StoreOpenApiStatusResponse getStatus() {
		return syncLogRepository.findFirstBySyncTypeOrderByStartedAtDesc(SyncType.STORE_OPENAPI_SYNC)
				.map(syncLog -> new StoreOpenApiStatusResponse(
						properties.enabled(),
						hasServiceKey(),
						hasBaseUrl(),
						scheduleService.isSchedulerEnabled(),
						properties.cron(),
						properties.defaultPageSize(),
						properties.maxPagesPerRun(),
						syncLog.getStartedAt(),
						syncLog.getStatus()))
				.orElseGet(() -> new StoreOpenApiStatusResponse(
						properties.enabled(),
						hasServiceKey(),
						hasBaseUrl(),
						scheduleService.isSchedulerEnabled(),
						properties.cron(),
						properties.defaultPageSize(),
						properties.maxPagesPerRun(),
						null,
						null));
	}

	public StoreOpenApiStatusResponse updateSchedule(StoreOpenApiScheduleRequest request) {
		scheduleService.updateSchedulerEnabled(request.schedulerEnabled());
		return getStatus();
	}

	public StoreOpenApiSyncRequest defaultScheduledRequest() {
		StoreOpenApiSyncRequest request = new StoreOpenApiSyncRequest();
		request.setSidoName(properties.defaultSidoName());
		request.setSigunguName(properties.defaultSigunguName());
		request.setPageNo(1);
		request.setPageSize(properties.defaultPageSize());
		request.setMaxPages(properties.maxPagesPerRun());
		request.setDryRun(false);
		return request;
	}

	private void validateConfiguration() {
		if (!properties.enabled()) {
			throw new BadRequestException("OpenAPI 동기화 기능이 비활성화되어 있습니다.");
		}
		if (!hasBaseUrl()) {
			throw new BadRequestException("OpenAPI baseUrl이 설정되지 않았습니다.");
		}
		if (!hasServiceKey()) {
			throw new BadRequestException("공공데이터 service key가 설정되지 않았습니다.");
		}
	}

	private boolean hasBaseUrl() {
		return StringUtils.hasText(properties.baseUrl());
	}

	private boolean hasServiceKey() {
		return StringUtils.hasText(properties.serviceKey());
	}

	private ResolvedRequest resolveRequest(StoreOpenApiSyncRequest request) {
		int pageSize = request.getPageSize() == null ? properties.defaultPageSize() : request.getPageSize();
		int maxPages = request.getMaxPages() == null ? properties.maxPagesPerRun() : request.getMaxPages();
		maxPages = Math.min(maxPages, properties.maxPagesPerRun());

		return new ResolvedRequest(
				request.getOperation(),
				normalize(request.getSidoName(), properties.defaultSidoName()),
				normalize(request.getSigunguName(), properties.defaultSigunguName()),
				normalize(request.getDongName(), null),
				normalize(request.getCategoryLargeCode(), null),
				normalize(request.getCategoryMediumCode(), null),
				normalize(request.getCategorySmallCode(), null),
				normalize(request.getDivId(), null),
				normalize(request.getKey(), null),
				request.getRadius(),
				request.getCx(),
				request.getCy(),
				normalize(request.getChangedDate(), null),
				request.getPageNo(),
				pageSize,
				maxPages,
				request.getDryRun());
	}

	private String normalize(String value, String defaultValue) {
		return StringUtils.hasText(value) ? value.trim() : defaultValue;
	}

	private String buildSourceName(ResolvedRequest request) {
		StringBuilder builder = new StringBuilder("OpenAPI ");
		builder.append(request.operation()).append(" ");
		builder.append(request.sidoName());
		if (StringUtils.hasText(request.sigunguName())) {
			builder.append(" ").append(request.sigunguName());
		}
		if (StringUtils.hasText(request.dongName())) {
			builder.append(" ").append(request.dongName());
		}
		return builder.toString();
	}

	private StoreOpenApiRequest buildOpenApiRequest(ResolvedRequest request, int pageNo) {
		if ("RADIUS".equals(request.operation())) {
			validateRadiusRequest(request);
			return new StoreOpenApiRequest(
					"storeListInRadius",
					null,
					null,
					request.radius(),
					request.cx(),
					request.cy(),
					request.categoryLargeCode(),
					request.categoryMediumCode(),
					request.categorySmallCode(),
					pageNo,
					request.pageSize());
		}
		if ("DATE".equals(request.operation())) {
			String key = StringUtils.hasText(request.key()) ? request.key() : request.changedDate();
			if (!StringUtils.hasText(key)) {
				throw new BadRequestException("수정일자 기준 조회에는 key 또는 changedDate가 필요합니다.");
			}
			return new StoreOpenApiRequest(
					"storeListByDate",
					null,
					key,
					null,
					null,
					null,
					request.categoryLargeCode(),
					request.categoryMediumCode(),
					request.categorySmallCode(),
					pageNo,
					request.pageSize());
		}

		RegionFilter regionFilter = resolveRegionFilter(request);
		return new StoreOpenApiRequest(
				"storeListInDong",
				regionFilter.divId(),
				regionFilter.key(),
				null,
				null,
				null,
				request.categoryLargeCode(),
				request.categoryMediumCode(),
				request.categorySmallCode(),
				pageNo,
				request.pageSize());
	}

	private void validateRadiusRequest(ResolvedRequest request) {
		if (request.radius() == null || request.cx() == null || request.cy() == null) {
			throw new BadRequestException("반경 조회에는 radius, cx, cy가 필요합니다.");
		}
	}

	private RegionFilter resolveRegionFilter(ResolvedRequest request) {
		if (StringUtils.hasText(request.divId()) && StringUtils.hasText(request.key())) {
			return new RegionFilter(request.divId(), request.key());
		}
		if (!StringUtils.hasText(request.sidoName())
				&& !StringUtils.hasText(request.sigunguName())
				&& !StringUtils.hasText(request.dongName())) {
			return new RegionFilter(properties.defaultDivId(), properties.defaultRegionKey());
		}

		Region region;
		if (StringUtils.hasText(request.dongName())) {
			region = regionRepository
					.findFirstBySidoNameAndSigunguNameAndDongNameOrderByDongNameAsc(
							request.sidoName(),
							request.sigunguName(),
							request.dongName())
					.orElseThrow(() -> new BadRequestException("OpenAPI 조회에 사용할 행정동 코드를 찾을 수 없습니다."));
			return new RegionFilter("adongCd", region.getDongCode());
		}
		if (StringUtils.hasText(request.sigunguName())) {
			region = regionRepository
					.findFirstBySidoNameAndSigunguNameOrderByDongNameAsc(
							request.sidoName(),
							request.sigunguName())
					.orElseThrow(() -> new BadRequestException("OpenAPI 조회에 사용할 시군구 코드를 찾을 수 없습니다."));
			return new RegionFilter("signguCd", region.getSigunguCode());
		}

		region = regionRepository
				.findFirstBySidoNameOrderBySigunguNameAscDongNameAsc(request.sidoName())
				.orElseThrow(() -> new BadRequestException("OpenAPI 조회에 사용할 시도 코드를 찾을 수 없습니다."));
		return new RegionFilter("ctprvnCd", region.getSidoCode());
	}

	private SyncStatus resolveStatus(int successRows, int failedRows) {
		if (failedRows == 0) {
			return SyncStatus.SUCCESS;
		}
		if (successRows > 0) {
			return SyncStatus.PARTIAL_SUCCESS;
		}
		return SyncStatus.FAILED;
	}

	private String buildMessage(SyncStatus status, boolean dryRun, int fetchedRows, int successRows, int failedRows) {
		if (fetchedRows == 0 && failedRows == 0) {
			return "OpenAPI에서 조회된 row가 없습니다.";
		}
		if (status == SyncStatus.SUCCESS) {
			return dryRun ? "OpenAPI dry-run 검증이 완료되었습니다." : "OpenAPI 동기화가 완료되었습니다.";
		}
		if (status == SyncStatus.PARTIAL_SUCCESS) {
			return "일부 OpenAPI row가 실패했지만 " + successRows + "개 row를 처리했습니다.";
		}
		return "처리 가능한 OpenAPI row가 없습니다.";
	}

	private String buildErrorSummary(List<StoreOpenApiRowErrorResponse> errors) {
		if (errors.isEmpty()) {
			return null;
		}
		return limitErrors(errors).stream()
				.map(error -> "page " + error.pageNo() + " row " + error.rowNumber() + ": " + error.message())
				.reduce((left, right) -> left + "\n" + right)
				.orElse(null);
	}

	private List<StoreOpenApiRowErrorResponse> limitErrors(List<StoreOpenApiRowErrorResponse> errors) {
		return errors.stream()
				.limit(storeSyncProperties.maxErrorSummaryCount())
				.toList();
	}

	private List<StoreOpenApiRowErrorResponse> appendError(
			List<StoreOpenApiRowErrorResponse> errors,
			int requestedPages,
			String message
	) {
		List<StoreOpenApiRowErrorResponse> nextErrors = new ArrayList<>(errors);
		nextErrors.add(new StoreOpenApiRowErrorResponse(Math.max(requestedPages, 1), 0, message));
		return nextErrors;
	}

	private record ResolvedRequest(
			String operation,
			String sidoName,
			String sigunguName,
			String dongName,
			String categoryLargeCode,
			String categoryMediumCode,
			String categorySmallCode,
			String divId,
			String key,
			Integer radius,
			BigDecimal cx,
			BigDecimal cy,
			String changedDate,
			int pageNo,
			int pageSize,
			int maxPages,
			boolean dryRun
	) {
	}

	private record RegionFilter(String divId, String key) {
	}
}
