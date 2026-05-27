package com.localbizradar.api.sync.service;

import java.util.concurrent.atomic.AtomicBoolean;

import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class StoreOpenApiSyncScheduler {

	private final StoreOpenApiSyncService storeOpenApiSyncService;
	private final StoreOpenApiScheduleService scheduleService;
	private final SyncLogRepository syncLogRepository;
	private final AtomicBoolean running = new AtomicBoolean(false);

	public StoreOpenApiSyncScheduler(
			StoreOpenApiSyncService storeOpenApiSyncService,
			StoreOpenApiScheduleService scheduleService,
			SyncLogRepository syncLogRepository
	) {
		this.storeOpenApiSyncService = storeOpenApiSyncService;
		this.scheduleService = scheduleService;
		this.syncLogRepository = syncLogRepository;
	}

	@Scheduled(cron = "${localbiz.store-openapi.cron}")
	public void syncScheduledStores() {
		if (!scheduleService.isSchedulerEnabled()) {
			return;
		}
		if (syncLogRepository.existsBySyncTypeAndStatus(SyncType.STORE_OPENAPI_SYNC, SyncStatus.RUNNING)) {
			return;
		}
		if (!running.compareAndSet(false, true)) {
			return;
		}
		try {
			storeOpenApiSyncService.syncStores(storeOpenApiSyncService.defaultScheduledRequest());
		} finally {
			running.set(false);
		}
	}
}
