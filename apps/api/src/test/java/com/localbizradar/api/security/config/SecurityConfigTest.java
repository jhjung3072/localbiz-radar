package com.localbizradar.api.security.config;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.localbizradar.api.master.repository.CategoryMasterRepository;
import com.localbizradar.api.master.repository.RegionMasterRepository;
import com.localbizradar.api.region.repository.RegionRepository;
import com.localbizradar.api.security.jwt.JwtTokenService;
import com.localbizradar.api.security.jwt.TokenResult;
import com.localbizradar.api.security.properties.LocalBizSecurityProperties;
import com.localbizradar.api.security.repository.AdminRefreshTokenRepository;
import com.localbizradar.api.store.repository.StoreRepository;
import com.localbizradar.api.sync.repository.SyncLogRepository;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.actuate.observability.AutoConfigureObservability;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockCookie;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
		"spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
				+ "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,"
				+ "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration,"
				+ "org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
				+ "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration"
})
@AutoConfigureMockMvc
@AutoConfigureObservability
@SuppressWarnings({"rawtypes", "unchecked"})
class SecurityConfigTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtTokenService jwtTokenService;

	@Autowired
	private LocalBizSecurityProperties properties;

	@MockitoBean
	private StoreRepository storeRepository;

	@MockitoBean
	private RegionRepository regionRepository;

	@MockitoBean
	private SyncLogRepository syncLogRepository;

	@MockitoBean
	private RegionMasterRepository regionMasterRepository;

	@MockitoBean
	private CategoryMasterRepository categoryMasterRepository;

	@MockitoBean
	private AdminRefreshTokenRepository adminRefreshTokenRepository;

	@Test
	void adminApiRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/admin/sync/logs"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
	}

	@Test
	void adminApiAllowsValidAccessTokenCookie() throws Exception {
		given(syncLogRepository.findAll(any(Specification.class), any(Pageable.class)))
				.willReturn(Page.empty());
		TokenResult token = jwtTokenService.createAccessToken(properties.admin().username());

		mockMvc.perform(get("/api/admin/sync/logs")
						.cookie(new MockCookie(properties.cookie().accessTokenName(), token.token())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content").isArray());
	}

	@Test
	void adminOpsApiRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/admin/ops/overview"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
	}

	@Test
	void adminOpsApiAllowsValidAccessTokenCookie() throws Exception {
		given(storeRepository.count()).willReturn(10L);
		given(storeRepository.countWithCoordinates()).willReturn(9L);
		given(regionMasterRepository.count()).willReturn(3L);
		given(categoryMasterRepository.count()).willReturn(4L);
		TokenResult token = jwtTokenService.createAccessToken(properties.admin().username());

		mockMvc.perform(get("/api/admin/ops/overview")
						.cookie(new MockCookie(properties.cookie().accessTokenName(), token.token())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.totalStores").value(10))
				.andExpect(jsonPath("$.service.status").value("UP"));
	}

	@Test
	void publicApiAllowsAnonymousAccess() throws Exception {
		mockMvc.perform(get("/api/health"))
				.andExpect(status().isOk());
	}

	@Test
	void actuatorPrometheusAllowsAnonymousAccess() throws Exception {
		mockMvc.perform(get("/actuator/prometheus"))
				.andExpect(status().isOk());
	}
}
