package com.localbizradar.api.region.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.localbizradar.api.region.dto.DongResponse;
import com.localbizradar.api.region.dto.RegionResponse;
import com.localbizradar.api.region.dto.SigunguResponse;
import com.localbizradar.api.region.repository.RegionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RegionService {

	private final RegionRepository regionRepository;

	public RegionService(RegionRepository regionRepository) {
		this.regionRepository = regionRepository;
	}

	public List<RegionResponse> getRegions() {
		Map<String, SidoGroup> sidoGroups = new LinkedHashMap<>();

		regionRepository.findRegionRows().forEach(row -> {
			SidoGroup sidoGroup = sidoGroups.computeIfAbsent(
					row.sidoCode(),
					key -> new SidoGroup(row.sidoCode(), row.sidoName()));
			SigunguGroup sigunguGroup = sidoGroup.sigunguGroups.computeIfAbsent(
					row.sigunguCode(),
					key -> new SigunguGroup(row.sigunguCode(), row.sigunguName()));
			sigunguGroup.dongList.add(new DongResponse(row.dongCode(), row.dongName()));
		});

		return sidoGroups.values().stream()
				.map(SidoGroup::toResponse)
				.toList();
	}

	private static class SidoGroup {

		private final String sidoCode;
		private final String sidoName;
		private final Map<String, SigunguGroup> sigunguGroups = new LinkedHashMap<>();

		private SidoGroup(String sidoCode, String sidoName) {
			this.sidoCode = sidoCode;
			this.sidoName = sidoName;
		}

		private RegionResponse toResponse() {
			return new RegionResponse(
					sidoCode,
					sidoName,
					sigunguGroups.values().stream()
							.map(SigunguGroup::toResponse)
							.toList());
		}
	}

	private static class SigunguGroup {

		private final String sigunguCode;
		private final String sigunguName;
		private final List<DongResponse> dongList = new ArrayList<>();

		private SigunguGroup(String sigunguCode, String sigunguName) {
			this.sigunguCode = sigunguCode;
			this.sigunguName = sigunguName;
		}

		private SigunguResponse toResponse() {
			return new SigunguResponse(sigunguCode, sigunguName, dongList);
		}
	}
}
