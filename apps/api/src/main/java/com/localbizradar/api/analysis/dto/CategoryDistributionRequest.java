package com.localbizradar.api.analysis.dto;

import jakarta.validation.constraints.Size;

public class CategoryDistributionRequest {

	@Size(max = 50)
	private String sido;

	@Size(max = 50)
	private String sigungu;

	@Size(max = 50)
	private String dong;

	private CategoryDepth depth = CategoryDepth.SMALL;

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

	public CategoryDepth getDepth() {
		return depth;
	}

	public void setDepth(CategoryDepth depth) {
		this.depth = depth == null ? CategoryDepth.SMALL : depth;
	}

	public AnalysisCondition toCondition() {
		return new AnalysisCondition(null, sido, null, sigungu, null, dong, null, null, null);
	}
}
