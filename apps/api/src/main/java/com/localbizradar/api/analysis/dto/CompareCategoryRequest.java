package com.localbizradar.api.analysis.dto;

import jakarta.validation.constraints.Size;

public class CompareCategoryRequest {

	@Size(max = 20)
	private String indsLclsCd;

	@Size(max = 80)
	private String indsLclsNm;

	@Size(max = 20)
	private String indsMclsCd;

	@Size(max = 80)
	private String indsMclsNm;

	@Size(max = 20)
	private String indsSclsCd;

	@Size(max = 80)
	private String indsSclsNm;

	public String getIndsLclsCd() {
		return indsLclsCd;
	}

	public void setIndsLclsCd(String indsLclsCd) {
		this.indsLclsCd = indsLclsCd;
	}

	public String getIndsLclsNm() {
		return indsLclsNm;
	}

	public void setIndsLclsNm(String indsLclsNm) {
		this.indsLclsNm = indsLclsNm;
	}

	public String getIndsMclsCd() {
		return indsMclsCd;
	}

	public void setIndsMclsCd(String indsMclsCd) {
		this.indsMclsCd = indsMclsCd;
	}

	public String getIndsMclsNm() {
		return indsMclsNm;
	}

	public void setIndsMclsNm(String indsMclsNm) {
		this.indsMclsNm = indsMclsNm;
	}

	public String getIndsSclsCd() {
		return indsSclsCd;
	}

	public void setIndsSclsCd(String indsSclsCd) {
		this.indsSclsCd = indsSclsCd;
	}

	public String getIndsSclsNm() {
		return indsSclsNm;
	}

	public void setIndsSclsNm(String indsSclsNm) {
		this.indsSclsNm = indsSclsNm;
	}

	public AnalysisCondition toCondition() {
		return new AnalysisCondition(
				null,
				null,
				null,
				null,
				null,
				null,
				indsLclsCd,
				indsMclsCd,
				indsSclsCd);
	}
}
