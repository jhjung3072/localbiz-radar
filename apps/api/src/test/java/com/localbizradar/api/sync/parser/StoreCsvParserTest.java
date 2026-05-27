package com.localbizradar.api.sync.parser;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class StoreCsvParserTest {

	private final StoreCsvParser storeCsvParser = new StoreCsvParser();

	@Test
	void parsesValidCsvWithHeaders() {
		StoreCsvParseResult result = storeCsvParser.parse(
				new ByteArrayInputStream(validCsv().getBytes(StandardCharsets.UTF_8)),
				100,
				false);

		assertThat(result.totalRows()).isEqualTo(1);
		assertThat(result.rows()).hasSize(1);
		assertThat(result.errors()).isEmpty();
		assertThat(result.rows().get(0).externalStoreId()).isEqualTo("LBZ-001");
		assertThat(result.rows().get(0).storeName()).isEqualTo("테스트 커피");
	}

	@Test
	void recordsInvalidRowsWithoutFailingWholeImport() {
		String csv = validCsv()
				+ "LBZ-002,, ,Q,음식,Q12,카페,Q12A01,커피전문점,서울특별시,강남구,역삼동,"
				+ "서울특별시 강남구 역삼동,서울특별시 강남구 테헤란로 1,not-number,37.4991000\n";

		StoreCsvParseResult result = storeCsvParser.parse(
				new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8)),
				100,
				false);

		assertThat(result.totalRows()).isEqualTo(2);
		assertThat(result.rows()).hasSize(1);
		assertThat(result.errors()).hasSize(1);
		assertThat(result.errors().get(0).message()).contains("상호명", "경도");
	}

	private String validCsv() {
		return """
				상가업소번호,상호명,지점명,상권업종대분류코드,상권업종대분류명,상권업종중분류코드,상권업종중분류명,상권업종소분류코드,상권업종소분류명,시도명,시군구명,행정동명,지번주소,도로명주소,경도,위도
				LBZ-001,테스트 커피,,Q,음식,Q12,카페,Q12A01,커피전문점,서울특별시,강남구,역삼동,서울특별시 강남구 역삼동,서울특별시 강남구 테헤란로 1,127.0328920,37.4991240
				""";
	}
}
