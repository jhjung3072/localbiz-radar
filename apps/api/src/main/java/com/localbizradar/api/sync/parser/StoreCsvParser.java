package com.localbizradar.api.sync.parser;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PushbackInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.localbizradar.api.common.error.BadRequestException;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class StoreCsvParser {

	private static final List<String> EXTERNAL_STORE_ID_HEADERS = List.of("상가업소번호", "상가업소관리번호");
	private static final List<String> STORE_NAME_HEADERS = List.of("상호명");
	private static final List<String> BRANCH_NAME_HEADERS = List.of("지점명", "지점명칭");
	private static final List<String> CATEGORY_LARGE_CODE_HEADERS = List.of("상권업종대분류코드");
	private static final List<String> CATEGORY_LARGE_NAME_HEADERS = List.of("상권업종대분류명");
	private static final List<String> CATEGORY_MEDIUM_CODE_HEADERS = List.of("상권업종중분류코드");
	private static final List<String> CATEGORY_MEDIUM_NAME_HEADERS = List.of("상권업종중분류명");
	private static final List<String> CATEGORY_SMALL_CODE_HEADERS = List.of("상권업종소분류코드");
	private static final List<String> CATEGORY_SMALL_NAME_HEADERS = List.of("상권업종소분류명");
	private static final List<String> SIDO_HEADERS = List.of("시도명");
	private static final List<String> SIGUNGU_HEADERS = List.of("시군구명");
	private static final List<String> DONG_HEADERS = List.of("행정동명", "법정동명");
	private static final List<String> LOT_ADDRESS_HEADERS = List.of("지번주소");
	private static final List<String> ROAD_ADDRESS_HEADERS = List.of("도로명주소");
	private static final List<String> LONGITUDE_HEADERS = List.of("경도");
	private static final List<String> LATITUDE_HEADERS = List.of("위도");

	public StoreCsvParseResult parse(InputStream inputStream, int maxRows, boolean failFast) {
		List<StoreCsvRow> rows = new ArrayList<>();
		List<StoreCsvParseError> errors = new ArrayList<>();
		int totalRows = 0;

		try (
				BufferedReader reader = new BufferedReader(
						new InputStreamReader(skipUtf8Bom(inputStream), StandardCharsets.UTF_8));
				CSVParser parser = CSVFormat.DEFAULT.builder()
						.setHeader()
						.setSkipHeaderRecord(true)
						.setIgnoreEmptyLines(true)
						.setTrim(true)
						.get()
						.parse(reader)
		) {
			for (CSVRecord record : parser) {
				totalRows++;
				if (totalRows > maxRows) {
					errors.add(new StoreCsvParseError(
							record.getRecordNumber() + 1,
							"CSV row 수가 최대 허용치 " + maxRows + "개를 초과해 이후 row 처리를 중단했습니다"));
					break;
				}

				ParsedRow parsedRow = parseRecord(record, parser.getHeaderMap());
				if (parsedRow.error() != null) {
					errors.add(parsedRow.error());
					if (failFast) {
						break;
					}
					continue;
				}
				rows.add(parsedRow.row());
			}
		} catch (BadRequestException exception) {
			throw exception;
		} catch (IllegalArgumentException exception) {
			throw new BadRequestException("CSV header 또는 row 형식을 확인해 주세요.");
		} catch (IOException exception) {
			throw new BadRequestException("CSV 파일을 읽지 못했습니다.");
		}

		return new StoreCsvParseResult(totalRows, rows, errors);
	}

	private ParsedRow parseRecord(CSVRecord record, Map<String, Integer> headerMap) {
		long rowNumber = record.getRecordNumber() + 1;
		List<String> validationErrors = new ArrayList<>();

		String externalStoreId = required(record, headerMap, EXTERNAL_STORE_ID_HEADERS, "상가업소번호", validationErrors);
		String storeName = required(record, headerMap, STORE_NAME_HEADERS, "상호명", validationErrors);
		String categoryLargeCode = required(record, headerMap, CATEGORY_LARGE_CODE_HEADERS, "상권업종대분류코드", validationErrors);
		String categoryLargeName = required(record, headerMap, CATEGORY_LARGE_NAME_HEADERS, "상권업종대분류명", validationErrors);
		String categoryMediumCode = required(record, headerMap, CATEGORY_MEDIUM_CODE_HEADERS, "상권업종중분류코드", validationErrors);
		String categoryMediumName = required(record, headerMap, CATEGORY_MEDIUM_NAME_HEADERS, "상권업종중분류명", validationErrors);
		String categorySmallCode = required(record, headerMap, CATEGORY_SMALL_CODE_HEADERS, "상권업종소분류코드", validationErrors);
		String categorySmallName = required(record, headerMap, CATEGORY_SMALL_NAME_HEADERS, "상권업종소분류명", validationErrors);
		String sido = required(record, headerMap, SIDO_HEADERS, "시도명", validationErrors);
		String sigungu = required(record, headerMap, SIGUNGU_HEADERS, "시군구명", validationErrors);
		String dong = required(record, headerMap, DONG_HEADERS, "행정동명", validationErrors);
		String longitudeValue = required(record, headerMap, LONGITUDE_HEADERS, "경도", validationErrors);
		String latitudeValue = required(record, headerMap, LATITUDE_HEADERS, "위도", validationErrors);

		BigDecimal longitude = parseCoordinate(longitudeValue, "경도", -180, 180, validationErrors);
		BigDecimal latitude = parseCoordinate(latitudeValue, "위도", -90, 90, validationErrors);

		if (!validationErrors.isEmpty()) {
			return new ParsedRow(null, new StoreCsvParseError(rowNumber, String.join(", ", validationErrors)));
		}

		return new ParsedRow(
				new StoreCsvRow(
						rowNumber,
						externalStoreId,
						storeName,
						optional(record, headerMap, BRANCH_NAME_HEADERS),
						categoryLargeCode,
						categoryLargeName,
						categoryMediumCode,
						categoryMediumName,
						categorySmallCode,
						categorySmallName,
						sido,
						sigungu,
						dong,
						optional(record, headerMap, LOT_ADDRESS_HEADERS),
						optional(record, headerMap, ROAD_ADDRESS_HEADERS),
						longitude,
						latitude),
				null);
	}

	private String required(
			CSVRecord record,
			Map<String, Integer> headerMap,
			List<String> headers,
			String displayName,
			List<String> validationErrors
	) {
		String value = optional(record, headerMap, headers);
		if (!StringUtils.hasText(value)) {
			validationErrors.add(displayName + " 값이 없습니다");
			return "";
		}
		return value;
	}

	private String optional(CSVRecord record, Map<String, Integer> headerMap, List<String> headers) {
		for (String header : headers) {
			if (headerMap.containsKey(header)) {
				String value = record.get(header);
				return StringUtils.hasText(value) ? value.trim() : null;
			}
		}
		return null;
	}

	private BigDecimal parseCoordinate(
			String value,
			String displayName,
			double min,
			double max,
			List<String> validationErrors
	) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		try {
			BigDecimal coordinate = new BigDecimal(value.trim());
			double doubleValue = coordinate.doubleValue();
			if (doubleValue < min || doubleValue > max) {
				validationErrors.add(displayName + " 범위가 올바르지 않습니다");
				return null;
			}
			return coordinate;
		} catch (NumberFormatException exception) {
			validationErrors.add(displayName + " 숫자 형식이 올바르지 않습니다");
			return null;
		}
	}

	private InputStream skipUtf8Bom(InputStream inputStream) throws IOException {
		PushbackInputStream pushbackInputStream = new PushbackInputStream(inputStream, 3);
		byte[] bom = new byte[3];
		int read = pushbackInputStream.read(bom, 0, bom.length);
		boolean hasBom = read == 3
				&& (bom[0] & 0xFF) == 0xEF
				&& (bom[1] & 0xFF) == 0xBB
				&& (bom[2] & 0xFF) == 0xBF;

		if (!hasBom && read > 0) {
			pushbackInputStream.unread(bom, 0, read);
		}

		return pushbackInputStream;
	}

	private record ParsedRow(StoreCsvRow row, StoreCsvParseError error) {
	}
}
