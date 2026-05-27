package com.localbizradar.api.master.openapi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UpjongItem(
		String indsLclsCd,
		String indsLclsNm,
		String indsMclsCd,
		String indsMclsNm,
		String indsSclsCd,
		String indsSclsNm,
		String stdrDt
) {
}
