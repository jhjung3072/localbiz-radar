package com.localbizradar.api.analysis.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class CompetitionRequest {

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

	@DecimalMin("-90.0")
	@DecimalMax("90.0")
	private Double lat;

	@DecimalMin("-180.0")
	@DecimalMax("180.0")
	private Double lng;

	@Min(1)
	@Max(10000)
	private Integer radius = 500;

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

	public Double getLat() {
		return lat;
	}

	public void setLat(Double lat) {
		this.lat = lat;
	}

	public Double getLng() {
		return lng;
	}

	public void setLng(Double lng) {
		this.lng = lng;
	}

	public Integer getRadius() {
		return radius == null ? 500 : radius;
	}

	public void setRadius(Integer radius) {
		this.radius = radius == null ? 500 : radius;
	}

	public AnalysisCondition toRegionCondition() {
		return new AnalysisCondition(null, sido, null, sigungu, null, dong, null, null, null);
	}

	public AnalysisCondition toCategoryCondition() {
		return new AnalysisCondition(
				null,
				null,
				null,
				null,
				null,
				null,
				categoryLargeCode,
				categoryMediumCode,
				categorySmallCode);
	}

	public boolean hasRegion() {
		return hasText(sido) || hasText(sigungu) || hasText(dong);
	}

	public boolean hasCoordinateSearch() {
		return lat != null && lng != null && radius != null;
	}

	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
