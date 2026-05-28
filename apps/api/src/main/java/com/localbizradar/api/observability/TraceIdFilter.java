package com.localbizradar.api.observability;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

	public static final String HEADER_NAME = "X-Request-Id";
	public static final String MDC_KEY = "traceId";

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain
	) throws ServletException, IOException {
		String traceId = resolveTraceId(request);
		MDC.put(MDC_KEY, traceId);
		response.setHeader(HEADER_NAME, traceId);

		try {
			filterChain.doFilter(request, response);
		}
		finally {
			MDC.remove(MDC_KEY);
		}
	}

	private String resolveTraceId(HttpServletRequest request) {
		String requestId = request.getHeader(HEADER_NAME);
		if (requestId == null || requestId.isBlank()) {
			return UUID.randomUUID().toString();
		}
		return requestId.trim();
	}
}
