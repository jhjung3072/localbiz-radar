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
@Table(name = "region_masters")
public class RegionMaster {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "region_type", nullable = false, length = 20)
	private RegionType regionType;

	@Column(name = "ctprvn_cd", length = 10)
	private String ctprvnCd;

	@Column(name = "ctprvn_nm", length = 80)
	private String ctprvnNm;

	@Column(name = "signgu_cd", length = 10)
	private String signguCd;

	@Column(name = "signgu_nm", length = 80)
	private String signguNm;

	@Column(name = "adong_cd", length = 20)
	private String adongCd;

	@Column(name = "adong_nm", length = 80)
	private String adongNm;

	@Column(name = "ldong_cd", length = 20)
	private String ldongCd;

	@Column(name = "ldong_nm", length = 80)
	private String ldongNm;

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

	protected RegionMaster() {
	}

	public static RegionMaster create(
			RegionType regionType,
			String ctprvnCd,
			String ctprvnNm,
			String signguCd,
			String signguNm,
			String adongCd,
			String adongNm,
			String ldongCd,
			String ldongNm,
			String parentCode,
			String code,
			String name,
			LocalDate standardDate,
			String sourceSystem,
			LocalDateTime syncedAt
	) {
		RegionMaster master = new RegionMaster();
		master.regionType = regionType;
		master.code = code;
		master.createdAt = syncedAt;
		master.update(
				ctprvnCd,
				ctprvnNm,
				signguCd,
				signguNm,
				adongCd,
				adongNm,
				ldongCd,
				ldongNm,
				parentCode,
				name,
				standardDate,
				sourceSystem,
				syncedAt);
		return master;
	}

	public void update(
			String ctprvnCd,
			String ctprvnNm,
			String signguCd,
			String signguNm,
			String adongCd,
			String adongNm,
			String ldongCd,
			String ldongNm,
			String parentCode,
			String name,
			LocalDate standardDate,
			String sourceSystem,
			LocalDateTime syncedAt
	) {
		this.ctprvnCd = ctprvnCd;
		this.ctprvnNm = ctprvnNm;
		this.signguCd = signguCd;
		this.signguNm = signguNm;
		this.adongCd = adongCd;
		this.adongNm = adongNm;
		this.ldongCd = ldongCd;
		this.ldongNm = ldongNm;
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

	public RegionType getRegionType() {
		return regionType;
	}

	public String getCtprvnCd() {
		return ctprvnCd;
	}

	public String getCtprvnNm() {
		return ctprvnNm;
	}

	public String getSignguCd() {
		return signguCd;
	}

	public String getSignguNm() {
		return signguNm;
	}

	public String getAdongCd() {
		return adongCd;
	}

	public String getAdongNm() {
		return adongNm;
	}

	public String getLdongCd() {
		return ldongCd;
	}

	public String getLdongNm() {
		return ldongNm;
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
