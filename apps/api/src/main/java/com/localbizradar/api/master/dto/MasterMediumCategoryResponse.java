package com.localbizradar.api.master.dto;

import java.util.List;

public record MasterMediumCategoryResponse(
		String indsMclsCd,
		String indsMclsNm,
		List<MasterSmallCategoryResponse> smallCategories
) {
}
