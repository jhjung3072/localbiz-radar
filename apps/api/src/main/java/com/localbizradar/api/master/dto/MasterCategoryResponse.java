package com.localbizradar.api.master.dto;

import java.util.List;

public record MasterCategoryResponse(
		String indsLclsCd,
		String indsLclsNm,
		List<MasterMediumCategoryResponse> mediumCategories
) {
}
