package com.localbizradar.api.store.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stores")
public class Store {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "store_name", nullable = false, length = 120)
	private String storeName;

	@Column(name = "branch_name", length = 120)
	private String branchName;

	@Column(name = "category_large_code", nullable = false, length = 20)
	private String categoryLargeCode;

	@Column(name = "category_large_name", nullable = false, length = 80)
	private String categoryLargeName;

	@Column(name = "category_medium_code", nullable = false, length = 20)
	private String categoryMediumCode;

	@Column(name = "category_medium_name", nullable = false, length = 80)
	private String categoryMediumName;

	@Column(name = "category_small_code", nullable = false, length = 20)
	private String categorySmallCode;

	@Column(name = "category_small_name", nullable = false, length = 80)
	private String categorySmallName;

	@Column(nullable = false, length = 50)
	private String sido;

	@Column(nullable = false, length = 50)
	private String sigungu;

	@Column(nullable = false, length = 50)
	private String dong;

	@Column(name = "lot_address")
	private String lotAddress;

	@Column(name = "road_address")
	private String roadAddress;

	@Column(precision = 10, scale = 7)
	private BigDecimal latitude;

	@Column(precision = 10, scale = 7)
	private BigDecimal longitude;

	@Column(name = "external_store_id", length = 80)
	private String externalStoreId;

	@Column(name = "source_system", length = 50)
	private String sourceSystem;

	@Column(name = "last_synced_at")
	private LocalDateTime lastSyncedAt;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	protected Store() {
	}

	public static Store createImported(
			String externalStoreId,
			String sourceSystem,
			String storeName,
			String branchName,
			String categoryLargeCode,
			String categoryLargeName,
			String categoryMediumCode,
			String categoryMediumName,
			String categorySmallCode,
			String categorySmallName,
			String sido,
			String sigungu,
			String dong,
			String lotAddress,
			String roadAddress,
			BigDecimal latitude,
			BigDecimal longitude,
			LocalDateTime syncedAt
	) {
		Store store = new Store();
		store.externalStoreId = externalStoreId;
		store.sourceSystem = sourceSystem;
		store.createdAt = syncedAt;
		store.updateImported(
				storeName,
				branchName,
				categoryLargeCode,
				categoryLargeName,
				categoryMediumCode,
				categoryMediumName,
				categorySmallCode,
				categorySmallName,
				sido,
				sigungu,
				dong,
				lotAddress,
				roadAddress,
				latitude,
				longitude,
				syncedAt);
		return store;
	}

	public void updateImported(
			String storeName,
			String branchName,
			String categoryLargeCode,
			String categoryLargeName,
			String categoryMediumCode,
			String categoryMediumName,
			String categorySmallCode,
			String categorySmallName,
			String sido,
			String sigungu,
			String dong,
			String lotAddress,
			String roadAddress,
			BigDecimal latitude,
			BigDecimal longitude,
			LocalDateTime syncedAt
	) {
		this.storeName = storeName;
		this.branchName = branchName;
		this.categoryLargeCode = categoryLargeCode;
		this.categoryLargeName = categoryLargeName;
		this.categoryMediumCode = categoryMediumCode;
		this.categoryMediumName = categoryMediumName;
		this.categorySmallCode = categorySmallCode;
		this.categorySmallName = categorySmallName;
		this.sido = sido;
		this.sigungu = sigungu;
		this.dong = dong;
		this.lotAddress = lotAddress;
		this.roadAddress = roadAddress;
		this.latitude = latitude;
		this.longitude = longitude;
		this.lastSyncedAt = syncedAt;
		this.updatedAt = syncedAt;
	}

	public Long getId() {
		return id;
	}

	public String getStoreName() {
		return storeName;
	}

	public String getBranchName() {
		return branchName;
	}

	public String getCategoryLargeCode() {
		return categoryLargeCode;
	}

	public String getCategoryLargeName() {
		return categoryLargeName;
	}

	public String getCategoryMediumCode() {
		return categoryMediumCode;
	}

	public String getCategoryMediumName() {
		return categoryMediumName;
	}

	public String getCategorySmallCode() {
		return categorySmallCode;
	}

	public String getCategorySmallName() {
		return categorySmallName;
	}

	public String getSido() {
		return sido;
	}

	public String getSigungu() {
		return sigungu;
	}

	public String getDong() {
		return dong;
	}

	public String getLotAddress() {
		return lotAddress;
	}

	public String getRoadAddress() {
		return roadAddress;
	}

	public BigDecimal getLatitude() {
		return latitude;
	}

	public BigDecimal getLongitude() {
		return longitude;
	}

	public String getExternalStoreId() {
		return externalStoreId;
	}

	public String getSourceSystem() {
		return sourceSystem;
	}

	public LocalDateTime getLastSyncedAt() {
		return lastSyncedAt;
	}
}
