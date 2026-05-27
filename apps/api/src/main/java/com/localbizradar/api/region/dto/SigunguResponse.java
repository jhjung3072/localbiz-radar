package com.localbizradar.api.region.dto;

import java.util.List;

public record SigunguResponse(
		String sigunguCode,
		String sigunguName,
		List<DongResponse> dongList
) {
}
