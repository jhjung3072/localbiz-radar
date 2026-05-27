package com.localbizradar.api.sync.service;

public record StoreUpsertResult(boolean inserted) {

	public boolean updated() {
		return !inserted;
	}
}
