package com.localbizradar.api.master.dto;

import java.util.List;

public record MasterSigunguResponse(
		String signguCd,
		String signguNm,
		List<MasterDongResponse> adminDongList,
		List<MasterDongResponse> legalDongList
) {
}
