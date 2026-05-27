package com.localbizradar.api.sync.dto;

import com.localbizradar.api.sync.parser.StoreCsvParseError;

public record StoreCsvRowErrorResponse(
		long rowNumber,
		String message
) {

	public static StoreCsvRowErrorResponse from(StoreCsvParseError error) {
		return new StoreCsvRowErrorResponse(error.rowNumber(), error.message());
	}
}
