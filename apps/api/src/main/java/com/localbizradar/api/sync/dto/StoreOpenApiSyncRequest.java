package com.localbizradar.api.sync.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class StoreOpenApiSyncRequest {

	@Pattern(regexp = "DONG|RADIUS|DATE")
	private String operation = "DONG";

	@Size(max = 50)
	private String sidoName;

	@Size(max = 50)
	private String sigunguName;

	@Size(max = 50)
	private String dongName;

	@Size(max = 20)
	private String categoryLargeCode;

	@Size(max = 20)
	private String categoryMediumCode;

	@Size(max = 20)
	private String categorySmallCode;

	@Pattern(regexp = "ctprvnCd|signguCd|adongCd")
	private String divId;

	@Size(max = 30)
	private String key;

	@Min(1)
	@Max(2000)
	private Integer radius;

	@DecimalMin("-180.0")
	@DecimalMax("180.0")
	private BigDecimal cx;

	@DecimalMin("-90.0")
	@DecimalMax("90.0")
	private BigDecimal cy;

	@Pattern(regexp = "\\d{8}")
	private String changedDate;

	@Min(1)
	private Integer pageNo = 1;

	@Min(1)
	@Max(1000)
	private Integer pageSize;

	@Min(1)
	@Max(10)
	private Integer maxPages;

	private Boolean dryRun = true;

	public String getOperation() {
		return operation == null ? "DONG" : operation;
	}

	public void setOperation(String operation) {
		this.operation = operation == null ? "DONG" : operation;
	}

	public String getSidoName() {
		return sidoName;
	}

	public void setSidoName(String sidoName) {
		this.sidoName = sidoName;
	}

	public String getSigunguName() {
		return sigunguName;
	}

	public void setSigunguName(String sigunguName) {
		this.sigunguName = sigunguName;
	}

	public String getDongName() {
		return dongName;
	}

	public void setDongName(String dongName) {
		this.dongName = dongName;
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

	public String getDivId() {
		return divId;
	}

	public void setDivId(String divId) {
		this.divId = divId;
	}

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public Integer getRadius() {
		return radius;
	}

	public void setRadius(Integer radius) {
		this.radius = radius;
	}

	public BigDecimal getCx() {
		return cx;
	}

	public void setCx(BigDecimal cx) {
		this.cx = cx;
	}

	public BigDecimal getCy() {
		return cy;
	}

	public void setCy(BigDecimal cy) {
		this.cy = cy;
	}

	public String getChangedDate() {
		return changedDate;
	}

	public void setChangedDate(String changedDate) {
		this.changedDate = changedDate;
	}

	public Integer getPageNo() {
		return pageNo == null ? 1 : pageNo;
	}

	public void setPageNo(Integer pageNo) {
		this.pageNo = pageNo == null ? 1 : pageNo;
	}

	public Integer getPageSize() {
		return pageSize;
	}

	public void setPageSize(Integer pageSize) {
		this.pageSize = pageSize;
	}

	public Integer getMaxPages() {
		return maxPages;
	}

	public void setMaxPages(Integer maxPages) {
		this.maxPages = maxPages;
	}

	public Boolean getDryRun() {
		return dryRun == null || dryRun;
	}

	public void setDryRun(Boolean dryRun) {
		this.dryRun = dryRun == null || dryRun;
	}

	public StoreOpenApiSyncRequest forceDryRun() {
		StoreOpenApiSyncRequest request = copy();
		request.setDryRun(true);
		return request;
	}

	public StoreOpenApiSyncRequest copy() {
		StoreOpenApiSyncRequest request = new StoreOpenApiSyncRequest();
		request.setOperation(operation);
		request.setSidoName(sidoName);
		request.setSigunguName(sigunguName);
		request.setDongName(dongName);
		request.setCategoryLargeCode(categoryLargeCode);
		request.setCategoryMediumCode(categoryMediumCode);
		request.setCategorySmallCode(categorySmallCode);
		request.setDivId(divId);
		request.setKey(key);
		request.setRadius(radius);
		request.setCx(cx);
		request.setCy(cy);
		request.setChangedDate(changedDate);
		request.setPageNo(pageNo);
		request.setPageSize(pageSize);
		request.setMaxPages(maxPages);
		request.setDryRun(dryRun);
		return request;
	}
}
