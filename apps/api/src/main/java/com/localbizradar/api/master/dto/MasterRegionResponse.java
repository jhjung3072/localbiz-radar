package com.localbizradar.api.master.dto;

import java.util.List;

public record MasterRegionResponse(
		String ctprvnCd,
		String ctprvnNm,
		List<MasterSigunguResponse> sigunguList
) {
}
