package com.localbizradar.api.region.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "regions")
public class Region {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "sido_code", nullable = false, length = 10)
	private String sidoCode;

	@Column(name = "sido_name", nullable = false, length = 50)
	private String sidoName;

	@Column(name = "sigungu_code", nullable = false, length = 10)
	private String sigunguCode;

	@Column(name = "sigungu_name", nullable = false, length = 50)
	private String sigunguName;

	@Column(name = "dong_code", nullable = false, length = 20)
	private String dongCode;

	@Column(name = "dong_name", nullable = false, length = 50)
	private String dongName;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	protected Region() {
	}

	public String getSidoCode() {
		return sidoCode;
	}

	public String getSidoName() {
		return sidoName;
	}

	public String getSigunguCode() {
		return sigunguCode;
	}

	public String getSigunguName() {
		return sigunguName;
	}

	public String getDongCode() {
		return dongCode;
	}

	public String getDongName() {
		return dongName;
	}
}
