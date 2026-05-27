package com.localbizradar.api.store.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StoreNearbyRequest {

	@NotNull
	@DecimalMin("-90.0")
	@DecimalMax("90.0")
	private Double lat;

	@NotNull
	@DecimalMin("-180.0")
	@DecimalMax("180.0")
	private Double lng;

	@Min(100)
	@Max(3000)
	private Integer radius = 500;

	@Size(max = 20)
	private String categoryLargeCode;

	@Size(max = 20)
	private String categoryMediumCode;

	@Size(max = 20)
	private String categorySmallCode;

	@Min(1)
	@Max(500)
	private Integer limit = 100;

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

	public Integer getLimit() {
		return limit == null ? 100 : limit;
	}

	public void setLimit(Integer limit) {
		this.limit = limit == null ? 100 : limit;
	}
}
