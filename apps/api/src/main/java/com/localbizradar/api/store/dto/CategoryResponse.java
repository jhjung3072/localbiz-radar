package com.localbizradar.api.store.dto;

import java.util.List;

public record CategoryResponse(
		String largeCode,
		String largeName,
		List<MediumCategoryResponse> mediumCategories
) {
}
