package com.localbizradar.api.sync.openapi.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JsonIgnoreProperties(ignoreUnknown = true)
@JacksonXmlRootElement(localName = "response")
public record StoreOpenApiResponse(Header header, Body body) {

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Header(
			String description,
			String columns,
			String stdrYm,
			String resultCode,
			String resultMsg
	) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Body(
			Items items,
			Integer totalCount,
			Integer numOfRows,
			Integer pageNo
	) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Items(
			@JacksonXmlElementWrapper(useWrapping = false)
			@JacksonXmlProperty(localName = "item")
			List<StoreOpenApiItem> item
	) {
	}
}
