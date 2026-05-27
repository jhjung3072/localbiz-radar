package com.localbizradar.api.store.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.dto.StoreMapItemResponse;
import com.localbizradar.api.store.dto.StoreMapRequest;
import com.localbizradar.api.store.dto.StoreNearbyItemResponse;
import com.localbizradar.api.store.dto.StoreNearbyRequest;
import com.localbizradar.api.store.repository.StoreRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("unchecked")
class StoreMapServiceTest {

	@Mock
	private StoreRepository storeRepository;

	@InjectMocks
	private StoreMapService storeMapService;

	@Test
	void returnsOnlyStoresWithCoordinatesForMap() {
		when(storeRepository.findAll(
				org.mockito.ArgumentMatchers.<Specification<Store>>any(),
				org.mockito.ArgumentMatchers.any(Pageable.class)))
				.thenReturn(new PageImpl<>(List.of(
						store("역삼 모닝커피", "Q", "Q12", "Q12A01", "37.4991240", "127.0328920"),
						store("좌표 없는 점포", "Q", "Q12", "Q12A01", null, null))));

		List<StoreMapItemResponse> response = storeMapService.getMapStores(new StoreMapRequest());

		assertThat(response).hasSize(1);
		assertThat(response.get(0).storeName()).isEqualTo("역삼 모닝커피");
	}

	@Test
	void appliesCategoryFilterForMap() {
		when(storeRepository.findAll(
				org.mockito.ArgumentMatchers.<Specification<Store>>any(),
				org.mockito.ArgumentMatchers.any(Pageable.class)))
				.thenReturn(new PageImpl<>(List.of(
						store("역삼 모닝커피", "Q", "Q12", "Q12A01", "37.4991240", "127.0328920"),
						store("역삼 라이트편의점", "D", "D03", "D03A01", "37.4978500", "127.0276120"))));
		StoreMapRequest request = new StoreMapRequest();
		request.setCategoryLargeCode("Q");

		List<StoreMapItemResponse> response = storeMapService.getMapStores(request);

		assertThat(response).extracting(StoreMapItemResponse::categoryLargeCode).containsExactly("Q");
	}

	@Test
	void returnsNearbyStoresWithinRadiusSortedByDistance() {
		when(storeRepository.findAll(
				org.mockito.ArgumentMatchers.<Specification<Store>>any(),
				org.mockito.ArgumentMatchers.any(Sort.class)))
				.thenReturn(List.of(
						store("먼 점포", "Q", "Q12", "Q12A01", "37.5100000", "127.0400000"),
						store("가까운 점포", "Q", "Q12", "Q12A01", "37.4992000", "127.0329000")));
		StoreNearbyRequest request = new StoreNearbyRequest();
		request.setLat(37.4991240);
		request.setLng(127.0328920);
		request.setRadius(2000);

		List<StoreNearbyItemResponse> response = storeMapService.getNearbyStores(request);

		assertThat(response).hasSize(2);
		assertThat(response.get(0).storeName()).isEqualTo("가까운 점포");
		assertThat(response.get(0).distanceMeters()).isLessThan(response.get(1).distanceMeters());
	}

	@Test
	void excludesNearbyStoresOutsideRadius() {
		when(storeRepository.findAll(
				org.mockito.ArgumentMatchers.<Specification<Store>>any(),
				org.mockito.ArgumentMatchers.any(Sort.class)))
				.thenReturn(List.of(
						store("가까운 점포", "Q", "Q12", "Q12A01", "37.4992000", "127.0329000"),
						store("먼 점포", "Q", "Q12", "Q12A01", "37.5600000", "126.9250000")));
		StoreNearbyRequest request = new StoreNearbyRequest();
		request.setLat(37.4991240);
		request.setLng(127.0328920);
		request.setRadius(500);

		List<StoreNearbyItemResponse> response = storeMapService.getNearbyStores(request);

		assertThat(response).extracting(StoreNearbyItemResponse::storeName).containsExactly("가까운 점포");
	}

	private Store store(
			String storeName,
			String categoryLargeCode,
			String categoryMediumCode,
			String categorySmallCode,
			String latitude,
			String longitude
	) {
		Store store = new TestStore();
		ReflectionTestUtils.setField(store, "id", 1L);
		ReflectionTestUtils.setField(store, "storeName", storeName);
		ReflectionTestUtils.setField(store, "categoryLargeCode", categoryLargeCode);
		ReflectionTestUtils.setField(store, "categoryLargeName", categoryLargeCode.equals("Q") ? "음식" : "소매");
		ReflectionTestUtils.setField(store, "categoryMediumCode", categoryMediumCode);
		ReflectionTestUtils.setField(store, "categoryMediumName", categoryMediumCode.equals("Q12") ? "카페" : "종합소매");
		ReflectionTestUtils.setField(store, "categorySmallCode", categorySmallCode);
		ReflectionTestUtils.setField(store, "categorySmallName", categorySmallCode.equals("Q12A01") ? "커피전문점" : "편의점");
		ReflectionTestUtils.setField(store, "sido", "서울특별시");
		ReflectionTestUtils.setField(store, "sigungu", "강남구");
		ReflectionTestUtils.setField(store, "dong", "역삼동");
		ReflectionTestUtils.setField(store, "roadAddress", "서울특별시 강남구 테헤란로 128");
		ReflectionTestUtils.setField(store, "latitude", latitude == null ? null : new BigDecimal(latitude));
		ReflectionTestUtils.setField(store, "longitude", longitude == null ? null : new BigDecimal(longitude));
		return store;
	}

	private static class TestStore extends Store {
	}
}
