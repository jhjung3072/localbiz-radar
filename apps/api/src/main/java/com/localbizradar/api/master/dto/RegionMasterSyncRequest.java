package com.localbizradar.api.master.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

public class RegionMasterSyncRequest {

	@Pattern(regexp = "\\d{2}", message = "ctprvnCd는 2자리 시도 코드여야 합니다.")
	private String ctprvnCd = "11";

	private boolean includeSigungu = true;

	private boolean includeAdminDong = true;

	private boolean includeLegalDong = false;

	private boolean dryRun = true;

	@Min(1)
	@Max(25)
	private Integer maxSigunguCount = 25;

	@Min(1)
	@Max(100)
	private Integer maxDongCountPerSigungu = 50;

	public String getCtprvnCd() {
		return ctprvnCd;
	}

	public void setCtprvnCd(String ctprvnCd) {
		this.ctprvnCd = ctprvnCd;
	}

	public boolean isIncludeSigungu() {
		return includeSigungu;
	}

	public void setIncludeSigungu(boolean includeSigungu) {
		this.includeSigungu = includeSigungu;
	}

	public boolean isIncludeAdminDong() {
		return includeAdminDong;
	}

	public void setIncludeAdminDong(boolean includeAdminDong) {
		this.includeAdminDong = includeAdminDong;
	}

	public boolean isIncludeLegalDong() {
		return includeLegalDong;
	}

	public void setIncludeLegalDong(boolean includeLegalDong) {
		this.includeLegalDong = includeLegalDong;
	}

	public boolean isDryRun() {
		return dryRun;
	}

	public void setDryRun(boolean dryRun) {
		this.dryRun = dryRun;
	}

	public Integer getMaxSigunguCount() {
		return maxSigunguCount;
	}

	public void setMaxSigunguCount(Integer maxSigunguCount) {
		this.maxSigunguCount = maxSigunguCount;
	}

	public Integer getMaxDongCountPerSigungu() {
		return maxDongCountPerSigungu;
	}

	public void setMaxDongCountPerSigungu(Integer maxDongCountPerSigungu) {
		this.maxDongCountPerSigungu = maxDongCountPerSigungu;
	}

	public RegionMasterSyncRequest forceDryRun() {
		this.dryRun = true;
		return this;
	}
}
