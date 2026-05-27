package com.localbizradar.api.sync.openapi.mapper;

import com.localbizradar.api.sync.service.StoreUpsertCommand;

public record StoreOpenApiMapResult(StoreUpsertCommand command, String errorMessage) {

	public boolean valid() {
		return command != null;
	}
}
