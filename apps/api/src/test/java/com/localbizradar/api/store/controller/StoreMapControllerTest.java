package com.localbizradar.api.store.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.localbizradar.api.store.dto.StoreNearbyRequest;
import com.localbizradar.api.store.service.StoreMapService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StoreMapController.class)
class StoreMapControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private StoreMapService storeMapService;

	@Test
	void returnsBadRequestForInvalidLatitude() throws Exception {
		mockMvc.perform(get("/api/stores/nearby")
						.param("lat", "120")
						.param("lng", "127.032892")
						.param("radius", "500"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void acceptsValidNearbyRequest() throws Exception {
		org.mockito.Mockito.when(storeMapService.getNearbyStores(any(StoreNearbyRequest.class)))
				.thenReturn(java.util.List.of());

		mockMvc.perform(get("/api/stores/nearby")
						.param("lat", "37.499124")
						.param("lng", "127.032892")
						.param("radius", "500"))
				.andExpect(status().isOk());
	}
}
