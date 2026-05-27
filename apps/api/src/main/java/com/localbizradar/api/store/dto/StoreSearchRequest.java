package com.localbizradar.api.store.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class StoreSearchRequest {

	@Size(max = 100)
	private String keyword;

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

	@Min(0)
	private Integer page;

	@Min(1)
	@Max(100)
	private Integer size;

	public String getKeyword() {
		return keyword;
	}

	public void setKeyword(String keyword) {
		this.keyword = keyword;
	}

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

	public Integer getPage() {
		return page;
	}

	public void setPage(Integer page) {
		this.page = page;
	}

	public Integer getSize() {
		return size;
	}

	public void setSize(Integer size) {
		this.size = size;
	}

	public Pageable toPageable() {
		int pageNumber = page == null ? 0 : page;
		int pageSize = size == null ? 20 : Math.min(size, 100);

		return PageRequest.of(
				pageNumber,
				pageSize,
				Sort.by("sido").ascending()
						.and(Sort.by("sigungu").ascending())
						.and(Sort.by("dong").ascending())
						.and(Sort.by("storeName").ascending()));
	}
}
