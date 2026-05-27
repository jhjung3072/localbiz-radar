package com.localbizradar.api.sync.openapi.mapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import com.localbizradar.api.sync.openapi.dto.StoreOpenApiItem;
import com.localbizradar.api.sync.service.StoreUpsertCommand;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class StoreOpenApiMapper {

	private static final DateTimeFormatter CHANGE_DATE_FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;

	public StoreOpenApiMapResult toCommand(StoreOpenApiItem item, String sourceSystem) {
		List<String> errors = new ArrayList<>();

		String externalStoreId = required(item.bizesId(), "상가업소번호", errors);
		String storeName = required(item.bizesNm(), "상호명", errors);
		String categoryLargeCode = required(item.indsLclsCd(), "상권업종대분류코드", errors);
		String categoryLargeName = required(item.indsLclsNm(), "상권업종대분류명", errors);
		String categoryMediumCode = required(item.indsMclsCd(), "상권업종중분류코드", errors);
		String categoryMediumName = required(item.indsMclsNm(), "상권업종중분류명", errors);
		String categorySmallCode = required(item.indsSclsCd(), "상권업종소분류코드", errors);
		String categorySmallName = required(item.indsSclsNm(), "상권업종소분류명", errors);
		String sido = required(item.ctprvnNm(), "시도명", errors);
		String sigungu = required(item.signguNm(), "시군구명", errors);
		String dong = required(item.adongNm(), "행정동명", errors);
		BigDecimal longitude = parseCoordinate(item.lon(), "경도", -180, 180, errors);
		BigDecimal latitude = parseCoordinate(item.lat(), "위도", -90, 90, errors);
		LocalDate changedAt = parseChangeDate(item.chgDt(), errors);

		if (!errors.isEmpty()) {
			return new StoreOpenApiMapResult(null, String.join(", ", errors));
		}

		return new StoreOpenApiMapResult(
				new StoreUpsertCommand(
						externalStoreId,
						sourceSystem,
						storeName,
						trimToNull(item.brchNm()),
						categoryLargeCode,
						categoryLargeName,
						categoryMediumCode,
						categoryMediumName,
						categorySmallCode,
						categorySmallName,
						sido,
						sigungu,
						dong,
						trimToNull(item.lnoAdr()),
						trimToNull(item.rdnmAdr()),
						latitude,
						longitude,
						trimToNull(item.ctprvnCd()),
						trimToNull(item.signguCd()),
						trimToNull(item.adongCd()),
						trimToNull(item.ldongCd()),
						trimToNull(item.ldongNm()),
						trimToNull(item.lnoCd()),
						trimToNull(item.bldMngNo()),
						trimToNull(item.chgGb()),
						changedAt),
				null);
	}

	private String required(String value, String displayName, List<String> errors) {
		String trimmed = trimToNull(value);
		if (trimmed == null) {
			errors.add(displayName + " 값이 없습니다");
			return "";
		}
		return trimmed;
	}

	private BigDecimal parseCoordinate(
			String value,
			String displayName,
			double min,
			double max,
			List<String> errors
	) {
		String trimmed = trimToNull(value);
		if (trimmed == null) {
			errors.add(displayName + " 값이 없습니다");
			return null;
		}
		try {
			BigDecimal coordinate = new BigDecimal(trimmed);
			double doubleValue = coordinate.doubleValue();
			if (doubleValue < min || doubleValue > max) {
				errors.add(displayName + " 범위가 올바르지 않습니다");
				return null;
			}
			return coordinate;
		} catch (NumberFormatException exception) {
			errors.add(displayName + " 숫자 형식이 올바르지 않습니다");
			return null;
		}
	}

	private String trimToNull(String value) {
		return StringUtils.hasText(value) ? value.trim() : null;
	}

	private LocalDate parseChangeDate(String value, List<String> errors) {
		String trimmed = trimToNull(value);
		if (trimmed == null) {
			return null;
		}
		try {
			return LocalDate.parse(trimmed, CHANGE_DATE_FORMATTER);
		} catch (DateTimeParseException exception) {
			errors.add("수정일자 형식이 올바르지 않습니다");
			return null;
		}
	}
}
