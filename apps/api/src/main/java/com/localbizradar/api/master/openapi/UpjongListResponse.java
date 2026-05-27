package com.localbizradar.api.master.openapi;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JsonIgnoreProperties(ignoreUnknown = true)
@JacksonXmlRootElement(localName = "response")
public record UpjongListResponse(Header header, Body body) {

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
	public record Body(Items items) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Items(
			@JacksonXmlElementWrapper(useWrapping = false)
			@JacksonXmlProperty(localName = "item")
			List<UpjongItem> item
	) {
	}
}
