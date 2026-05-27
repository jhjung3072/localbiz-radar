package com.localbizradar.api.master.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import org.junit.jupiter.api.Test;

class MasterOpenApiResponseTest {

	@Test
	void parsesBaroApiRegionResponse() throws Exception {
		XmlMapper xmlMapper = new XmlMapper();
		xmlMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		BaroApiResponse response = xmlMapper.readValue(regionXml(), BaroApiResponse.class);

		assertThat(response.header().resultCode()).isEqualTo("00");
		assertThat(response.body().items().item()).hasSize(1);
		assertThat(response.body().items().item().getFirst().ctprvnCd()).isEqualTo("11");
		assertThat(response.body().items().item().getFirst().signguCd()).isEqualTo("11680");
		assertThat(response.body().items().item().getFirst().adongCd()).isEqualTo("11680640");
	}

	@Test
	void parsesUpjongListResponse() throws Exception {
		XmlMapper xmlMapper = new XmlMapper();
		xmlMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		UpjongListResponse response = xmlMapper.readValue(categoryXml(), UpjongListResponse.class);

		assertThat(response.header().resultCode()).isEqualTo("00");
		assertThat(response.body().items().item()).hasSize(1);
		assertThat(response.body().items().item().getFirst().indsLclsCd()).isEqualTo("I2");
		assertThat(response.body().items().item().getFirst().indsMclsCd()).isEqualTo("I201");
		assertThat(response.body().items().item().getFirst().indsSclsCd()).isEqualTo("I20102");
	}

	private String regionXml() {
		return """
				<response>
					<header>
						<description>소상공인시장진흥공단 행정동 코드</description>
						<columns>시도코드,시도명,시군구코드,시군구명,행정동코드,행정동명</columns>
						<resultCode>00</resultCode>
						<resultMsg>NORMAL SERVICE</resultMsg>
					</header>
					<body>
						<items>
							<item>
								<ctprvnCd>11</ctprvnCd>
								<ctprvnNm>서울특별시</ctprvnNm>
								<signguCd>11680</signguCd>
								<signguNm>강남구</signguNm>
								<adongCd>11680640</adongCd>
								<adongNm>역삼1동</adongNm>
								<stdrDt>20260101</stdrDt>
							</item>
						</items>
					</body>
				</response>
				""";
	}

	private String categoryXml() {
		return """
				<response>
					<header>
						<description>소상공인시장진흥공단 업종 코드</description>
						<columns>상권업종대분류코드,상권업종대분류명,상권업종중분류코드,상권업종중분류명,상권업종소분류코드,상권업종소분류명</columns>
						<resultCode>00</resultCode>
						<resultMsg>NORMAL SERVICE</resultMsg>
					</header>
					<body>
						<items>
							<item>
								<indsLclsCd>I2</indsLclsCd>
								<indsLclsNm>음식점</indsLclsNm>
								<indsMclsCd>I201</indsMclsCd>
								<indsMclsNm>한식</indsMclsNm>
								<indsSclsCd>I20102</indsSclsCd>
								<indsSclsNm>국/탕/찌개류</indsSclsNm>
								<stdrDt>20260101</stdrDt>
							</item>
						</items>
					</body>
				</response>
				""";
	}
}
