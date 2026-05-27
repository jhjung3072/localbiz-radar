package com.localbizradar.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.localbizradar.api.region.repository.RegionRepository;
import com.localbizradar.api.store.repository.StoreRepository;
import com.localbizradar.api.sync.repository.SyncLogRepository;

@SpringBootTest(properties = {
		"spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
				+ "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,"
				+ "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration,"
				+ "org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,"
				+ "org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration"
})
class ApiApplicationTests {

	@MockitoBean
	private StoreRepository storeRepository;

	@MockitoBean
	private RegionRepository regionRepository;

	@MockitoBean
	private SyncLogRepository syncLogRepository;

	@Test
	void contextLoads() {
	}

}
