package com.localbizradar.api.master.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "category_masters")
public class CategoryMaster {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "category_level", nullable = false, length = 20)
	private CategoryLevel categoryLevel;

	@Column(name = "inds_lcls_cd", length = 20)
	private String indsLclsCd;

	@Column(name = "inds_lcls_nm", length = 80)
	private String indsLclsNm;

	@Column(name = "inds_mcls_cd", length = 20)
	private String indsMclsCd;

	@Column(name = "inds_mcls_nm", length = 80)
	private String indsMclsNm;

	@Column(name = "inds_scls_cd", length = 20)
	private String indsSclsCd;

	@Column(name = "inds_scls_nm", length = 80)
	private String indsSclsNm;

	@Column(name = "parent_code", length = 20)
	private String parentCode;

	@Column(nullable = false, length = 20)
	private String code;

	@Column(nullable = false, length = 80)
	private String name;

	@Column(name = "standard_date")
	private LocalDate standardDate;

	@Column(name = "source_system", nullable = false, length = 50)
	private String sourceSystem;

	@Column(name = "last_synced_at")
	private LocalDateTime lastSyncedAt;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	protected CategoryMaster() {
	}

	public static CategoryMaster create(
			CategoryLevel categoryLevel,
			String indsLclsCd,
			String indsLclsNm,
			String indsMclsCd,
			String indsMclsNm,
			String indsSclsCd,
			String indsSclsNm,
			String parentCode,
			String code,
			String name,
			LocalDate standardDate,
			String sourceSystem,
			LocalDateTime syncedAt
	) {
		CategoryMaster master = new CategoryMaster();
		master.categoryLevel = categoryLevel;
		master.code = code;
		master.createdAt = syncedAt;
		master.update(
				indsLclsCd,
				indsLclsNm,
				indsMclsCd,
				indsMclsNm,
				indsSclsCd,
				indsSclsNm,
				parentCode,
				name,
				standardDate,
				sourceSystem,
				syncedAt);
		return master;
	}

	public void update(
			String indsLclsCd,
			String indsLclsNm,
			String indsMclsCd,
			String indsMclsNm,
			String indsSclsCd,
			String indsSclsNm,
			String parentCode,
			String name,
			LocalDate standardDate,
			String sourceSystem,
			LocalDateTime syncedAt
	) {
		this.indsLclsCd = indsLclsCd;
		this.indsLclsNm = indsLclsNm;
		this.indsMclsCd = indsMclsCd;
		this.indsMclsNm = indsMclsNm;
		this.indsSclsCd = indsSclsCd;
		this.indsSclsNm = indsSclsNm;
		this.parentCode = parentCode;
		this.name = name;
		this.standardDate = standardDate;
		this.sourceSystem = sourceSystem;
		this.lastSyncedAt = syncedAt;
		this.updatedAt = syncedAt;
	}

	public Long getId() {
		return id;
	}

	public CategoryLevel getCategoryLevel() {
		return categoryLevel;
	}

	public String getIndsLclsCd() {
		return indsLclsCd;
	}

	public String getIndsLclsNm() {
		return indsLclsNm;
	}

	public String getIndsMclsCd() {
		return indsMclsCd;
	}

	public String getIndsMclsNm() {
		return indsMclsNm;
	}

	public String getIndsSclsCd() {
		return indsSclsCd;
	}

	public String getIndsSclsNm() {
		return indsSclsNm;
	}

	public String getParentCode() {
		return parentCode;
	}

	public String getCode() {
		return code;
	}

	public String getName() {
		return name;
	}

	public LocalDate getStandardDate() {
		return standardDate;
	}

	public LocalDateTime getLastSyncedAt() {
		return lastSyncedAt;
	}
}
