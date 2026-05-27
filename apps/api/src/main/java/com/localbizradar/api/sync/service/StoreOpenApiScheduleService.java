package com.localbizradar.api.sync.service;

import java.util.concurrent.atomic.AtomicReference;

import com.localbizradar.api.sync.config.StoreOpenApiProperties;

import org.springframework.stereotype.Service;

@Service
public class StoreOpenApiScheduleService {

	private final StoreOpenApiProperties properties;
	private final AtomicReference<Boolean> schedulerEnabledOverride = new AtomicReference<>();

	public StoreOpenApiScheduleService(StoreOpenApiProperties properties) {
		this.properties = properties;
	}

	public boolean isSchedulerEnabled() {
		Boolean override = schedulerEnabledOverride.get();
		return override == null ? properties.schedulerEnabled() : override;
	}

	public boolean updateSchedulerEnabled(boolean enabled) {
		schedulerEnabledOverride.set(enabled);
		return enabled;
	}
}
