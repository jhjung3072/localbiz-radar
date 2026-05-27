package com.localbizradar.api.sync.openapi.client;

import java.net.URI;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.localbizradar.api.common.error.BadRequestException;
import com.localbizradar.api.sync.config.StoreOpenApiProperties;
import com.localbizradar.api.sync.openapi.dto.StoreOpenApiPage;
import com.localbizradar.api.sync.openapi.dto.StoreOpenApiRequest;
import com.localbizradar.api.sync.openapi.dto.StoreOpenApiResponse;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class PublicDataStoreOpenApiClient implements StoreOpenApiClient {

	private final RestClient storeOpenApiRestClient;
	private final XmlMapper storeOpenApiXmlMapper;
	private final StoreOpenApiProperties properties;

	public PublicDataStoreOpenApiClient(
			RestClient storeOpenApiRestClient,
			StoreOpenApiProperties properties
	) {
		this.storeOpenApiRestClient = storeOpenApiRestClient;
		this.storeOpenApiXmlMapper = new XmlMapper();
		this.storeOpenApiXmlMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		this.properties = properties;
	}

	@Override
	public StoreOpenApiPage fetchStores(StoreOpenApiRequest request) {
		URI uri = buildUri(request);

		try {
			String responseBody = storeOpenApiRestClient
					.get()
					.uri(uri)
					.accept(MediaType.APPLICATION_XML)
					.retrieve()
					.body(String.class);

			StoreOpenApiResponse response = parseResponse(responseBody);
			StoreOpenApiResponse.Header header = response == null ? null : response.header();
			if (header != null && StringUtils.hasText(header.resultCode()) && !"00".equals(header.resultCode())) {
				throw new BadRequestException("공공데이터 OpenAPI 응답 오류입니다. resultCode="
						+ header.resultCode()
						+ ", resultMsg="
						+ truncate(header.resultMsg()));
			}

			StoreOpenApiResponse.Body body = response == null ? null : response.body();
			if (body == null) {
				throw new BadRequestException("OpenAPI 응답 body를 확인할 수 없습니다.");
			}

			List<com.localbizradar.api.sync.openapi.dto.StoreOpenApiItem> items =
					body.items() == null || body.items().item() == null ? List.of() : body.items().item();

			return new StoreOpenApiPage(
					body.pageNo() == null ? request.pageNo() : body.pageNo(),
					body.numOfRows() == null ? request.pageSize() : body.numOfRows(),
					body.totalCount() == null ? items.size() : body.totalCount(),
					items);
		} catch (RestClientResponseException exception) {
			throw new BadRequestException("공공데이터 OpenAPI 호출에 실패했습니다. status="
					+ exception.getStatusCode().value()
					+ ", response="
					+ truncate(exception.getResponseBodyAsString()));
		} catch (RestClientException exception) {
			throw new BadRequestException("공공데이터 OpenAPI 호출에 실패했습니다.");
		}
	}

	private URI buildUri(StoreOpenApiRequest request) {
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromUriString(resolveOperationUrl(request.operationPath()))
				.queryParam("serviceKey", properties.serviceKey())
				.queryParam("type", "xml")
				.queryParam("pageNo", request.pageNo())
				.queryParam("numOfRows", request.pageSize());

		if ("storeListInRadius".equals(request.operationPath())) {
			builder.queryParam("radius", request.radius());
			builder.queryParam("cx", request.cx());
			builder.queryParam("cy", request.cy());
		} else if ("storeListByDate".equals(request.operationPath())) {
			builder.queryParam("key", request.key());
		} else {
			builder.queryParam("divId", request.divId());
			builder.queryParam("key", request.key());
		}

		addParam(builder, "indsLclsCd", request.categoryLargeCode());
		addParam(builder, "indsMclsCd", request.categoryMediumCode());
		addParam(builder, "indsSclsCd", request.categorySmallCode());

		return builder.build().encode().toUri();
	}

	private void addParam(UriComponentsBuilder builder, String key, String value) {
		if (StringUtils.hasText(value)) {
			builder.queryParam(key, value.trim());
		}
	}

	private String resolveOperationUrl(String operationPath) {
		String baseUrl = properties.baseUrl();
		String normalizedOperationPath = StringUtils.hasText(operationPath) ? operationPath : "storeListInDong";
		if (baseUrl.endsWith("/" + normalizedOperationPath)) {
			return baseUrl;
		}
		return baseUrl.endsWith("/") ? baseUrl + normalizedOperationPath : baseUrl + "/" + normalizedOperationPath;
	}

	private StoreOpenApiResponse parseResponse(String responseBody) {
		try {
			return storeOpenApiXmlMapper.readValue(responseBody, StoreOpenApiResponse.class);
		} catch (JsonProcessingException exception) {
			throw new BadRequestException("공공데이터 OpenAPI XML 응답을 파싱하지 못했습니다. reason="
					+ truncate(exception.getOriginalMessage()));
		}
	}

	private String truncate(String value) {
		if (!StringUtils.hasText(value)) {
			return "";
		}
		String trimmed = value.replaceAll("\\s+", " ").trim();
		return trimmed.length() <= 200 ? trimmed : trimmed.substring(0, 200);
	}
}
