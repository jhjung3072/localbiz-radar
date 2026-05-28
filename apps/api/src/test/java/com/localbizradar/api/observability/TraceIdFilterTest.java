package com.localbizradar.api.observability;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;

import jakarta.servlet.ServletException;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class TraceIdFilterTest {

	private final TraceIdFilter filter = new TraceIdFilter();

	@Test
	void createsTraceIdWhenRequestHeaderIsMissing() throws ServletException, IOException {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
		MockHttpServletResponse response = new MockHttpServletResponse();

		filter.doFilter(request, response, new MockFilterChain());

		assertThat(response.getHeader(TraceIdFilter.HEADER_NAME)).isNotBlank();
	}

	@Test
	void reusesRequestIdHeader() throws ServletException, IOException {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
		request.addHeader(TraceIdFilter.HEADER_NAME, "request-123");
		MockHttpServletResponse response = new MockHttpServletResponse();

		filter.doFilter(request, response, new MockFilterChain());

		assertThat(response.getHeader(TraceIdFilter.HEADER_NAME)).isEqualTo("request-123");
	}
}
