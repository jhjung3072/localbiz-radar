package com.localbizradar.api.store.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class StoreMapRequest {

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
	private Double minLat;

	@DecimalMin("-90.0")
	@DecimalMax("90.0")
	private Double maxLat;

	@DecimalMin("-180.0")
	@DecimalMax("180.0")
	private Double minLng;

	@DecimalMin("-180.0")
	@DecimalMax("180.0")
	private Double maxLng;

	@Min(1)
	@Max(1000)
	private Integer limit = 300;

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

	public Double getMinLat() {
		return minLat;
	}

	public void setMinLat(Double minLat) {
		this.minLat = minLat;
	}

	public Double getMaxLat() {
		return maxLat;
	}

	public void setMaxLat(Double maxLat) {
		this.maxLat = maxLat;
	}

	public Double getMinLng() {
		return minLng;
	}

	public void setMinLng(Double minLng) {
		this.minLng = minLng;
	}

	public Double getMaxLng() {
		return maxLng;
	}

	public void setMaxLng(Double maxLng) {
		this.maxLng = maxLng;
	}

	public Integer getLimit() {
		return limit == null ? 300 : limit;
	}

	public void setLimit(Integer limit) {
		this.limit = limit == null ? 300 : limit;
	}

	public boolean hasViewport() {
		return minLat != null && maxLat != null && minLng != null && maxLng != null;
	}
}
