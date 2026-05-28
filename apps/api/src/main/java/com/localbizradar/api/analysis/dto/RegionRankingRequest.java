package com.localbizradar.api.analysis.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class RegionRankingRequest {

	@Size(max = 10)
	private String ctprvnCd = "11";

	@Size(max = 10)
	private String signguCd;

	private RegionRankingGroupBy groupBy = RegionRankingGroupBy.SIGUNGU;

	@Size(max = 20)
	private String indsLclsCd;

	@Size(max = 20)
	private String indsMclsCd;

	@Size(max = 20)
	private String indsSclsCd;

	@Min(1)
	@Max(50)
	private Integer limit = 10;

	public String getCtprvnCd() {
		return ctprvnCd;
	}

	public void setCtprvnCd(String ctprvnCd) {
		this.ctprvnCd = ctprvnCd;
	}

	public String getSignguCd() {
		return signguCd;
	}

	public void setSignguCd(String signguCd) {
		this.signguCd = signguCd;
	}

	public RegionRankingGroupBy getGroupBy() {
		return groupBy == null ? RegionRankingGroupBy.SIGUNGU : groupBy;
	}

	public void setGroupBy(RegionRankingGroupBy groupBy) {
		this.groupBy = groupBy == null ? RegionRankingGroupBy.SIGUNGU : groupBy;
	}

	public String getIndsLclsCd() {
		return indsLclsCd;
	}

	public void setIndsLclsCd(String indsLclsCd) {
		this.indsLclsCd = indsLclsCd;
	}

	public String getIndsMclsCd() {
		return indsMclsCd;
	}

	public void setIndsMclsCd(String indsMclsCd) {
		this.indsMclsCd = indsMclsCd;
	}

	public String getIndsSclsCd() {
		return indsSclsCd;
	}

	public void setIndsSclsCd(String indsSclsCd) {
		this.indsSclsCd = indsSclsCd;
	}

	public Integer getLimit() {
		return limit == null ? 10 : limit;
	}

	public void setLimit(Integer limit) {
		this.limit = limit == null ? 10 : limit;
	}

	public AnalysisCondition toCategoryCondition() {
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
