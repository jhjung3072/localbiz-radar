package com.localbizradar.api.analysis.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;

public class CompareAreaRequest {

	@Size(max = 10)
	private String ctprvnCd;

	@Size(max = 50)
	private String ctprvnNm;

	@Size(max = 10)
	private String signguCd;

	@Size(max = 50)
	private String signguNm;

	@Size(max = 20)
	private String adongCd;

	@Size(max = 50)
	private String adongNm;

	@Size(max = 50)
	private String sido;

	@Size(max = 50)
	private String sigungu;

	@Size(max = 50)
	private String dong;

	@Size(max = 20)
	private String categoryLargeCode;

	@Size(max = 20)
	private String categoryMediumCode;

	@Size(max = 20)
	private String categorySmallCode;

	public String getCtprvnCd() {
		return ctprvnCd;
	}

	public void setCtprvnCd(String ctprvnCd) {
		this.ctprvnCd = ctprvnCd;
	}

	public String getCtprvnNm() {
		return ctprvnNm;
	}

	public void setCtprvnNm(String ctprvnNm) {
		this.ctprvnNm = ctprvnNm;
	}

	public String getSignguCd() {
		return signguCd;
	}

	public void setSignguCd(String signguCd) {
		this.signguCd = signguCd;
	}

	public String getSignguNm() {
		return signguNm;
	}

	public void setSignguNm(String signguNm) {
		this.signguNm = signguNm;
	}

	public String getAdongCd() {
		return adongCd;
	}

	public void setAdongCd(String adongCd) {
		this.adongCd = adongCd;
	}

	public String getAdongNm() {
		return adongNm;
	}

	public void setAdongNm(String adongNm) {
		this.adongNm = adongNm;
	}

	public String getSido() {
		return sido;
	}

	public void setSido(String sido) {
		this.sido = sido;
	}

	public String getSigungu() {
		return sigungu;
	}

	public void setSigungu(String sigungu) {
		this.sigungu = sigungu;
	}

	public String getDong() {
		return dong;
	}

	public void setDong(String dong) {
		this.dong = dong;
	}

	public String getCategoryLargeCode() {
		return categoryLargeCode;
	}

	public void setCategoryLargeCode(String categoryLargeCode) {
		this.categoryLargeCode = categoryLargeCode;
	}

	public String getCategoryMediumCode() {
		return categoryMediumCode;
	}

	public void setCategoryMediumCode(String categoryMediumCode) {
		this.categoryMediumCode = categoryMediumCode;
	}

	public String getCategorySmallCode() {
		return categorySmallCode;
	}

	public void setCategorySmallCode(String categorySmallCode) {
		this.categorySmallCode = categorySmallCode;
	}

	public AnalysisCondition toCondition() {
		return new AnalysisCondition(
				ctprvnCd,
				hasText(ctprvnNm) ? ctprvnNm : sido,
				signguCd,
				hasText(signguNm) ? signguNm : sigungu,
				adongCd,
				hasText(adongNm) ? adongNm : dong,
				categoryLargeCode,
				categoryMediumCode,
				categorySmallCode);
	}

	public String regionLabel() {
		return java.util.stream.Stream.of(
						hasText(ctprvnNm) ? ctprvnNm : sido,
						hasText(signguNm) ? signguNm : sigungu,
						hasText(adongNm) ? adongNm : dong)
				.filter(this::hasText)
				.map(String::trim)
				.collect(java.util.stream.Collectors.joining(" "));
	}

	@AssertTrue(message = "시도 코드 또는 시도명이 필요합니다.")
	public boolean isSidoProvided() {
		return hasText(ctprvnCd) || hasText(ctprvnNm) || hasText(sido);
	}

	@AssertTrue(message = "시군구 코드 또는 시군구명이 필요합니다.")
	public boolean isSigunguProvided() {
		return hasText(signguCd) || hasText(signguNm) || hasText(sigungu);
	}

	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
