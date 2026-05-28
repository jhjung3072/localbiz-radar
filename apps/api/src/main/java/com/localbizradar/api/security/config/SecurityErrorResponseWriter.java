package com.localbizradar.api.security.config;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localbizradar.api.common.error.ErrorResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

@Component
public class SecurityErrorResponseWriter {

	private final ObjectMapper objectMapper;

	public SecurityErrorResponseWriter(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	public void write(
			HttpServletRequest request,
			HttpServletResponse response,
			HttpStatus status,
			String code,
			String message
	) throws IOException {
		response.setStatus(status.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		objectMapper.writeValue(
				response.getWriter(),
				ErrorResponse.of(code, message, status.value(), request.getRequestURI()));
	}
}
