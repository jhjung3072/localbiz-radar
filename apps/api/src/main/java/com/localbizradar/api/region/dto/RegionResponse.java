package com.localbizradar.api.region.dto;

import java.util.List;

public record RegionResponse(
		String sidoCode,
		String sidoName,
		List<SigunguResponse> sigunguList
) {
}
