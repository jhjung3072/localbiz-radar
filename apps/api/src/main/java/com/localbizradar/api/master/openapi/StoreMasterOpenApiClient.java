package com.localbizradar.api.master.openapi;

import java.net.URI;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.localbizradar.api.common.error.BadRequestException;
import com.localbizradar.api.sync.config.StoreOpenApiProperties;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class StoreMasterOpenApiClient {

	private final RestClient storeOpenApiRestClient;
	private final StoreOpenApiProperties properties;
	private final XmlMapper xmlMapper;

	public StoreMasterOpenApiClient(
			RestClient storeOpenApiRestClient,
			StoreOpenApiProperties properties
	) {
		this.storeOpenApiRestClient = storeOpenApiRestClient;
		this.properties = properties;
		this.xmlMapper = new XmlMapper();
		this.xmlMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
	}

	public List<BaroApiItem> fetchSidoList() {
		return fetchBaroApi(buildBaroUri("mega", null, null)).items();
	}

	public List<BaroApiItem> fetchSigunguList(String ctprvnCd) {
		return fetchBaroApi(buildBaroUri("cty", "ctprvnCd", ctprvnCd)).items();
	}

	public List<BaroApiItem> fetchAdminDongList(String signguCd) {
		return fetchBaroApi(buildBaroUri("admi", "signguCd", signguCd)).items();
	}

	public List<BaroApiItem> fetchLegalDongList(String signguCd) {
		return fetchBaroApi(buildBaroUri("zone", "signguCd", signguCd)).items();
	}

	public List<UpjongItem> fetchLargeCategories() {
		return fetchUpjongList(buildOperationUri("largeUpjongList")).items();
	}

	public List<UpjongItem> fetchMediumCategories(String indsLclsCd) {
		UriComponentsBuilder builder = buildOperationUri("middleUpjongList");
		addParam(builder, "indsLclsCd", indsLclsCd);
		return fetchUpjongList(builder).items();
	}

	public List<UpjongItem> fetchSmallCategories(String indsLclsCd, String indsMclsCd) {
		UriComponentsBuilder builder = buildOperationUri("smallUpjongList");
		addParam(builder, "indsLclsCd", indsLclsCd);
		addParam(builder, "indsMclsCd", indsMclsCd);
		return fetchUpjongList(builder).items();
	}

	private BaroApiResult fetchBaroApi(UriComponentsBuilder builder) {
		String responseBody = request(builder.build().encode().toUri());
		BaroApiResponse response;
		try {
			response = xmlMapper.readValue(responseBody, BaroApiResponse.class);
		} catch (JsonProcessingException exception) {
			throw new BadRequestException("공공데이터 행정구역 XML 응답을 파싱하지 못했습니다. reason="
					+ truncate(exception.getOriginalMessage()));
		}

		validateHeader(response == null ? null : response.header());
		BaroApiResponse.Body body = response == null ? null : response.body();
		List<BaroApiItem> items = body == null || body.items() == null || body.items().item() == null
				? List.of()
				: body.items().item();
		return new BaroApiResult(items);
	}

	private UpjongListResult fetchUpjongList(UriComponentsBuilder builder) {
		String responseBody = request(builder.build().encode().toUri());
		UpjongListResponse response;
		try {
			response = xmlMapper.readValue(responseBody, UpjongListResponse.class);
		} catch (JsonProcessingException exception) {
			throw new BadRequestException("공공데이터 업종 XML 응답을 파싱하지 못했습니다. reason="
					+ truncate(exception.getOriginalMessage()));
		}

		validateHeader(response == null ? null : response.header());
		UpjongListResponse.Body body = response == null ? null : response.body();
		List<UpjongItem> items = body == null || body.items() == null || body.items().item() == null
				? List.of()
				: body.items().item();
		return new UpjongListResult(items);
	}

	private String request(URI uri) {
		validateConfiguration();
		waitForRequestInterval();
		try {
			return storeOpenApiRestClient
					.get()
					.uri(uri)
					.accept(MediaType.APPLICATION_XML)
					.retrieve()
					.body(String.class);
		} catch (RestClientResponseException exception) {
			if (exception.getStatusCode().value() == 429) {
				throw new BadRequestException("공공데이터 OpenAPI 호출 제한을 초과했습니다. 잠시 후 다시 시도하거나 동기화 범위를 줄여주세요.");
			}
			throw new BadRequestException("공공데이터 코드 마스터 OpenAPI 호출에 실패했습니다. status="
					+ exception.getStatusCode().value()
					+ ", response="
					+ truncate(exception.getResponseBodyAsString()));
		} catch (RestClientException exception) {
			throw new BadRequestException("공공데이터 코드 마스터 OpenAPI 호출에 실패했습니다.");
		}
	}

	private void waitForRequestInterval() {
		if (properties.requestIntervalMillis() <= 0) {
			return;
		}
		try {
			Thread.sleep(properties.requestIntervalMillis());
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			throw new BadRequestException("공공데이터 OpenAPI 호출 대기 중 작업이 중단되었습니다.");
		}
	}

	private UriComponentsBuilder buildBaroUri(String catId, String key, String value) {
		UriComponentsBuilder builder = buildOperationUri("baroApi")
				.queryParam("resId", "dong")
				.queryParam("catId", catId);
		addParam(builder, key, value);
		return builder;
	}

	private UriComponentsBuilder buildOperationUri(String operationPath) {
		return UriComponentsBuilder
				.fromUriString(resolveOperationUrl(operationPath))
				.queryParam("type", properties.defaultType())
				.queryParam("serviceKey", properties.serviceKey());
	}

	private void addParam(UriComponentsBuilder builder, String key, String value) {
		if (StringUtils.hasText(key) && StringUtils.hasText(value)) {
			builder.queryParam(key, value.trim());
		}
	}

	private String resolveOperationUrl(String operationPath) {
		String baseUrl = properties.baseUrl();
		if (baseUrl.endsWith("/" + operationPath)) {
			return baseUrl;
		}
		return baseUrl.endsWith("/") ? baseUrl + operationPath : baseUrl + "/" + operationPath;
	}

	private void validateConfiguration() {
		if (!properties.enabled()) {
			throw new BadRequestException("OpenAPI 동기화 기능이 비활성화되어 있습니다.");
		}
		if (!StringUtils.hasText(properties.baseUrl())) {
			throw new BadRequestException("OpenAPI baseUrl이 설정되지 않았습니다.");
		}
		if (!StringUtils.hasText(properties.serviceKey())) {
			throw new BadRequestException("공공데이터 service key가 설정되지 않았습니다.");
		}
	}

	private void validateHeader(BaroApiResponse.Header header) {
		String resultCode = header == null ? null : header.resultCode();
		if (StringUtils.hasText(resultCode) && !"00".equals(resultCode)) {
			throw new BadRequestException("공공데이터 행정구역 API 응답 오류입니다. resultCode="
					+ resultCode
					+ ", resultMsg="
					+ truncate(header.resultMsg()));
		}
	}

	private void validateHeader(UpjongListResponse.Header header) {
		String resultCode = header == null ? null : header.resultCode();
		if (StringUtils.hasText(resultCode) && !"00".equals(resultCode)) {
			throw new BadRequestException("공공데이터 업종 API 응답 오류입니다. resultCode="
					+ resultCode
					+ ", resultMsg="
					+ truncate(header.resultMsg()));
		}
	}

	private String truncate(String value) {
		if (!StringUtils.hasText(value)) {
			return "";
		}
		String trimmed = value.replaceAll("\\s+", " ").trim();
		return trimmed.length() <= 200 ? trimmed : trimmed.substring(0, 200);
	}

	private record BaroApiResult(List<BaroApiItem> items) {
	}

	private record UpjongListResult(List<UpjongItem> items) {
	}
}
