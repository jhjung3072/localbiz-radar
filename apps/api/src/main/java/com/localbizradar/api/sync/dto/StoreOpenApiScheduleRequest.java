package com.localbizradar.api.sync.dto;

import jakarta.validation.constraints.NotNull;

public record StoreOpenApiScheduleRequest(@NotNull Boolean schedulerEnabled) {
}
