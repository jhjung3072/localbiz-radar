package com.localbizradar.api.store.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import com.localbizradar.api.common.response.PageResponse;
import com.localbizradar.api.store.dto.StoreListItemResponse;
import com.localbizradar.api.store.dto.StoreSearchRequest;
import com.localbizradar.api.store.service.StoreService;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StoreController.class)
class StoreControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private StoreService storeService;

	@Test
	void returnsStorePage() throws Exception {
		StoreListItemResponse store = new StoreListItemResponse(
				1L,
				"역삼 모닝커피",
				"Q",
				"음식",
				"Q12",
				"카페",
				"Q12A01",
				"커피전문점",
				"서울특별시",
				"강남구",
				"역삼동",
				"서울특별시 강남구 테헤란로 128",
				new BigDecimal("37.4991240"),
				new BigDecimal("127.0328920"));
		given(storeService.getStores(any(StoreSearchRequest.class)))
				.willReturn(new PageResponse<>(List.of(store), 0, 20, 1, 1));

		mockMvc.perform(get("/api/stores")
						.param("keyword", "커피")
						.param("sido", "서울특별시"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].storeName").value("역삼 모닝커피"))
				.andExpect(jsonPath("$.content[0].categoryLargeCode").value("Q"))
				.andExpect(jsonPath("$.page").value(0))
				.andExpect(jsonPath("$.totalElements").value(1));

		ArgumentCaptor<StoreSearchRequest> captor = ArgumentCaptor.forClass(StoreSearchRequest.class);
		verify(storeService).getStores(captor.capture());
		org.assertj.core.api.Assertions.assertThat(captor.getValue().getKeyword()).isEqualTo("커피");
		org.assertj.core.api.Assertions.assertThat(captor.getValue().getSido()).isEqualTo("서울특별시");
	}
}
