package com.localbizradar.api.sync.openapi.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import org.junit.jupiter.api.Test;

class StoreOpenApiResponseTest {

	@Test
	void parsesStoreListXmlResponse() throws Exception {
		XmlMapper xmlMapper = new XmlMapper();
		xmlMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		StoreOpenApiResponse response = xmlMapper.readValue(xml(), StoreOpenApiResponse.class);

		assertThat(response.header().resultCode()).isEqualTo("00");
		assertThat(response.body().pageNo()).isEqualTo(1);
		assertThat(response.body().totalCount()).isEqualTo(64239);
		assertThat(response.body().items().item()).hasSize(1);
		assertThat(response.body().items().item().getFirst().bizesId()).isEqualTo("MA010120220700003416");
		assertThat(response.body().items().item().getFirst().ctprvnCd()).isEqualTo("11");
		assertThat(response.body().items().item().getFirst().signguCd()).isEqualTo("11680");
		assertThat(response.body().items().item().getFirst().adongCd()).isEqualTo("11680750");
		assertThat(response.body().items().item().getFirst().lon()).isEqualTo("127.102488521688");
	}

	private String xml() {
		return """
				<response>
					<header>
						<description>소상공인시장진흥공단 행정동별 상가업소정보</description>
						<columns>상가업소번호,상호명,지점명,상권업종대분류코드,상권업종대분류명</columns>
						<stdrYm>202603</stdrYm>
						<resultCode>00</resultCode>
						<resultMsg>NORMAL SERVICE</resultMsg>
					</header>
					<body>
						<items>
							<item>
								<bizesId>MA010120220700003416</bizesId>
								<bizesNm>삼성마음친구정신건강의학과</bizesNm>
								<brchNm></brchNm>
								<indsLclsCd>Q1</indsLclsCd>
								<indsLclsNm>보건의료</indsLclsNm>
								<indsMclsCd>Q102</indsMclsCd>
								<indsMclsNm>의원</indsMclsNm>
								<indsSclsCd>Q10201</indsSclsCd>
								<indsSclsNm>내과/소아과 의원</indsSclsNm>
								<ksicCd>Q86201</ksicCd>
								<ksicNm>일반의원</ksicNm>
								<ctprvnCd>11</ctprvnCd>
								<ctprvnNm>서울특별시</ctprvnNm>
								<signguCd>11680</signguCd>
								<signguNm>강남구</signguNm>
								<adongCd>11680750</adongCd>
								<adongNm>수서동</adongNm>
								<ldongCd>1168011500</ldongCd>
								<ldongNm>수서동</ldongNm>
								<lnoCd>1168011500107140000</lnoCd>
								<lnoAdr>서울특별시 강남구 수서동 714</lnoAdr>
								<bldMngNo>1168011500107140000026893</bldMngNo>
								<rdnmAdr>서울특별시 강남구 광평로51길 8</rdnmAdr>
								<lon>127.102488521688</lon>
								<lat>37.488367483961</lat>
							</item>
						</items>
						<numOfRows>1</numOfRows>
						<pageNo>1</pageNo>
						<totalCount>64239</totalCount>
					</body>
				</response>
				""";
	}
}
