package com.localbizradar.api.master.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class CategoryMasterSyncRequest {

	private boolean includeLarge = true;

	private boolean includeMedium = true;

	private boolean includeSmall = true;

	private String largeCategoryCode;

	private String mediumCategoryCode;

	private boolean dryRun = true;

	@Min(1)
	@Max(30)
	private Integer maxLargeCount;

	@Min(1)
	@Max(300)
	private Integer maxMediumCount;

	@Min(1)
	@Max(300)
	private Integer maxSmallCountPerMedium;

	public boolean isIncludeLarge() {
		return includeLarge;
	}

	public void setIncludeLarge(boolean includeLarge) {
		this.includeLarge = includeLarge;
	}

	public boolean isIncludeMedium() {
		return includeMedium;
	}

	public void setIncludeMedium(boolean includeMedium) {
		this.includeMedium = includeMedium;
	}

	public boolean isIncludeSmall() {
		return includeSmall;
	}

	public void setIncludeSmall(boolean includeSmall) {
		this.includeSmall = includeSmall;
	}

	public String getLargeCategoryCode() {
		return largeCategoryCode;
	}

	public void setLargeCategoryCode(String largeCategoryCode) {
		this.largeCategoryCode = largeCategoryCode;
	}

	public String getMediumCategoryCode() {
		return mediumCategoryCode;
	}

	public void setMediumCategoryCode(String mediumCategoryCode) {
		this.mediumCategoryCode = mediumCategoryCode;
	}

	public boolean isDryRun() {
		return dryRun;
	}

	public void setDryRun(boolean dryRun) {
		this.dryRun = dryRun;
	}

	public Integer getMaxLargeCount() {
		return maxLargeCount;
	}

	public void setMaxLargeCount(Integer maxLargeCount) {
		this.maxLargeCount = maxLargeCount;
	}

	public Integer getMaxMediumCount() {
		return maxMediumCount;
	}

	public void setMaxMediumCount(Integer maxMediumCount) {
		this.maxMediumCount = maxMediumCount;
	}

	public Integer getMaxSmallCountPerMedium() {
		return maxSmallCountPerMedium;
	}

	public void setMaxSmallCountPerMedium(Integer maxSmallCountPerMedium) {
		this.maxSmallCountPerMedium = maxSmallCountPerMedium;
	}

	public CategoryMasterSyncRequest forceDryRun() {
		this.dryRun = true;
		return this;
	}
}
