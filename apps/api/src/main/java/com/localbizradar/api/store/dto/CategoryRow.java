package com.localbizradar.api.store.dto;

public record CategoryRow(
		String largeCode,
		String largeName,
		String mediumCode,
		String mediumName,
		String smallCode,
		String smallName
) {
}
