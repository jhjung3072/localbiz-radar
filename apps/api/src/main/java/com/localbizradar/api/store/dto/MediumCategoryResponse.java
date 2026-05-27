package com.localbizradar.api.store.dto;

import java.util.List;

public record MediumCategoryResponse(
		String mediumCode,
		String mediumName,
		List<SmallCategoryResponse> smallCategories
) {
}
