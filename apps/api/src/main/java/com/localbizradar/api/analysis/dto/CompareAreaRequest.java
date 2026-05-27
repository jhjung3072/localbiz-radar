package com.localbizradar.api.analysis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CompareAreaRequest {

	@NotBlank
	@Size(max = 50)
	private String sido;

	@NotBlank
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
				sido,
				sigungu,
				dong,
				categoryLargeCode,
				categoryMediumCode,
				categorySmallCode);
	}
}
