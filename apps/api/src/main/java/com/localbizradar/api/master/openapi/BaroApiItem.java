package com.localbizradar.api.master.openapi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BaroApiItem(
		String ctprvnCd,
		String ctprvnNm,
		String signguCd,
		String signguNm,
		String adongCd,
		String adongNm,
		String ldongCd,
		String ldongNm,
		String stdrDt
) {
}
