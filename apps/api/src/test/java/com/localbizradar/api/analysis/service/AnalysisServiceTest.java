package com.localbizradar.api.analysis.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import com.localbizradar.api.analysis.dto.AnalysisSummaryRequest;
import com.localbizradar.api.analysis.dto.AnalysisSummaryResponse;
import com.localbizradar.api.analysis.dto.CategoryDepth;
import com.localbizradar.api.analysis.dto.CategoryDistributionItemResponse;
import com.localbizradar.api.analysis.dto.CategoryDistributionRequest;
import com.localbizradar.api.analysis.dto.CompareAnalysisRequest;
import com.localbizradar.api.analysis.dto.CompareAnalysisResponse;
import com.localbizradar.api.analysis.dto.CompareAreaRequest;
import com.localbizradar.api.analysis.dto.CompareCategoryRequest;
import com.localbizradar.api.analysis.dto.RegionRankingItemResponse;
import com.localbizradar.api.analysis.dto.RegionRankingRequest;
import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.repository.StoreRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("unchecked")
class AnalysisServiceTest {

	@Mock
	private StoreRepository storeRepository;

	@InjectMocks
	private AnalysisService analysisService;

	@Test
	void returnsSummaryWhenStoresExist() {
		when(storeRepository.findAll(
				org.mockito.ArgumentMatchers.<Specification<Store>>any(),
				org.mockito.ArgumentMatchers.any(Sort.class)))
				.thenReturn(List.of(
						store("역삼 모닝커피", "서울특별시", "강남구", "역삼동", "Q", "음식", "Q12", "카페", "Q12A01", "커피전문점"),
						store("역삼 라이트편의점", "서울특별시", "강남구", "역삼동", "D", "소매", "D03", "종합소매", "D03A01", "편의점")));

		AnalysisSummaryRequest request = new AnalysisSummaryRequest();
		request.setSido("서울특별시");
		request.setSigungu("강남구");

		AnalysisSummaryResponse response = analysisService.getSummary(request);

		assertThat(response.totalStores()).isEqualTo(2);
		assertThat(response.totalCategories()).isEqualTo(2);
		assertThat(response.selectedRegionLabel()).isEqualTo("서울특별시 강남구");
		assertThat(response.localBizScore()).isGreaterThan(0);
	}

	@Test
	void returnsCategoryDistributionSortedByStoreCountDesc() {
		when(storeRepository.findAll(
				org.mockito.ArgumentMatchers.<Specification<Store>>any(),
				org.mockito.ArgumentMatchers.any(Sort.class)))
				.thenReturn(List.of(
						store("연남 로스터리", "서울특별시", "마포구", "연남동", "Q", "음식", "Q12", "카페", "Q12A01", "커피전문점"),
						store("망원 시장카페", "서울특별시", "마포구", "망원동", "Q", "음식", "Q12", "카페", "Q12A01", "커피전문점"),
						store("망원 데일리편의점", "서울특별시", "마포구", "망원동", "D", "소매", "D03", "종합소매", "D03A01", "편의점")));
		CategoryDistributionRequest request = new CategoryDistributionRequest();
		request.setDepth(CategoryDepth.SMALL);

		List<CategoryDistributionItemResponse> response = analysisService.getCategoryDistribution(request);

		assertThat(response).hasSize(2);
		assertThat(response.get(0).categoryName()).isEqualTo("커피전문점");
		assertThat(response.get(0).storeCount()).isEqualTo(2);
	}

	@Test
	void comparesBaseAndTargetAreas() {
		when(storeRepository.findAll(
				org.mockito.ArgumentMatchers.<Specification<Store>>any(),
				org.mockito.ArgumentMatchers.any(Sort.class)))
				.thenReturn(
						List.of(
								store("성수 핸드드립", "서울특별시", "성동구", "성수동1가", "Q", "음식", "Q12", "카페", "Q12A01", "커피전문점"),
								store("성수 로컬마켓", "서울특별시", "성동구", "성수동2가", "D", "소매", "D03", "종합소매", "D03A02", "슈퍼마켓")),
						List.of(store("망원 시장카페", "서울특별시", "마포구", "망원동", "Q", "음식", "Q12", "카페", "Q12A01", "커피전문점")));

		CompareAnalysisResponse response = analysisService.compare(
				new CompareAnalysisRequest(area("서울특별시", "성동구"), area("서울특별시", "마포구")));

		assertThat(response.base().regionLabel()).isEqualTo("서울특별시 성동구");
		assertThat(response.target().regionLabel()).isEqualTo("서울특별시 마포구");
		assertThat(response.winner().regionLabel()).isNotBlank();
		assertThat(response.metricComparisons()).isNotEmpty();
	}

	@Test
	void appliesCategoryFilterWhenComparingAreas() {
		when(storeRepository.findAll(
				org.mockito.ArgumentMatchers.<Specification<Store>>any(),
				org.mockito.ArgumentMatchers.any(Sort.class)))
				.thenReturn(
						List.of(
								store("강남 카페", "서울특별시", "강남구", "역삼동", "Q", "음식", "Q12", "카페", "Q12A01", "커피전문점"),
								store("강남 편의점", "서울특별시", "강남구", "역삼동", "D", "소매", "D03", "종합소매", "D03A01", "편의점")),
						List.of(
								store("마포 카페", "서울특별시", "마포구", "망원동", "Q", "음식", "Q12", "카페", "Q12A01", "커피전문점")));
		CompareCategoryRequest category = new CompareCategoryRequest();
		category.setIndsLclsCd("Q");

		CompareAnalysisResponse response = analysisService.compare(
				new CompareAnalysisRequest(area("서울특별시", "강남구"), area("서울특별시", "마포구"), category));

		assertThat(response.base().totalStores()).isEqualTo(2);
		assertThat(response.base().categoryStoreCount()).isEqualTo(1);
		assertThat(response.base().categoryShare()).isEqualTo(50.0);
	}

	@Test
	void returnsRegionRankingSortedByLocalBizScoreDesc() {
		when(storeRepository.findAll(org.mockito.ArgumentMatchers.any(Sort.class)))
				.thenReturn(List.of(
						store("강남 카페", "서울특별시", "강남구", "역삼동", "Q", "음식", "Q12", "카페", "Q12A01", "커피전문점"),
						store("마포 카페", "서울특별시", "마포구", "망원동", "Q", "음식", "Q12", "카페", "Q12A01", "커피전문점"),
						store("마포 편의점", "서울특별시", "마포구", "망원동", "D", "소매", "D03", "종합소매", "D03A01", "편의점"),
						store("마포 학원", "서울특별시", "마포구", "연남동", "R", "교육", "R02", "예체능학원", "R02A01", "미술학원")));
		RegionRankingRequest request = new RegionRankingRequest();
		request.setIndsLclsCd("Q");

		List<RegionRankingItemResponse> response = analysisService.getRegionRanking(request);

		assertThat(response).hasSize(2);
		assertThat(response.get(0).localBizScore()).isGreaterThanOrEqualTo(response.get(1).localBizScore());
		assertThat(response.get(0).rank()).isEqualTo(1);
	}

	@Test
	void returnsZeroSummaryWhenNoStoresExist() {
		when(storeRepository.findAll(
				org.mockito.ArgumentMatchers.<Specification<Store>>any(),
				org.mockito.ArgumentMatchers.any(Sort.class)))
				.thenReturn(List.of());

		AnalysisSummaryResponse response = analysisService.getSummary(new AnalysisSummaryRequest());

		assertThat(response.totalStores()).isZero();
		assertThat(response.competitionIndex()).isZero();
		assertThat(response.categoryDiversityScore()).isZero();
		assertThat(response.localBizScore()).isZero();
	}

	private CompareAreaRequest area(String sido, String sigungu) {
		CompareAreaRequest request = new CompareAreaRequest();
		request.setSido(sido);
		request.setSigungu(sigungu);
		return request;
	}

	private Store store(
			String storeName,
			String sido,
			String sigungu,
			String dong,
			String categoryLargeCode,
			String categoryLargeName,
			String categoryMediumCode,
			String categoryMediumName,
			String categorySmallCode,
			String categorySmallName
	) {
		Store store = new TestStore();
		ReflectionTestUtils.setField(store, "storeName", storeName);
		ReflectionTestUtils.setField(store, "sido", sido);
		ReflectionTestUtils.setField(store, "sigungu", sigungu);
		ReflectionTestUtils.setField(store, "dong", dong);
		ReflectionTestUtils.setField(store, "categoryLargeCode", categoryLargeCode);
		ReflectionTestUtils.setField(store, "categoryLargeName", categoryLargeName);
		ReflectionTestUtils.setField(store, "categoryMediumCode", categoryMediumCode);
		ReflectionTestUtils.setField(store, "categoryMediumName", categoryMediumName);
		ReflectionTestUtils.setField(store, "categorySmallCode", categorySmallCode);
		ReflectionTestUtils.setField(store, "categorySmallName", categorySmallName);
		ReflectionTestUtils.setField(store, "latitude", new BigDecimal("37.5000000"));
		ReflectionTestUtils.setField(store, "longitude", new BigDecimal("127.0000000"));
		return store;
	}

	private static class TestStore extends Store {
	}
}
