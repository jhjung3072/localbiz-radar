package com.localbizradar.api.common.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleResourceNotFound(
			ResourceNotFoundException exception,
			HttpServletRequest request
	) {
		return build(HttpStatus.NOT_FOUND, "NOT_FOUND", exception.getMessage(), request);
	}

	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<ErrorResponse> handleBadRequestException(
			BadRequestException exception,
			HttpServletRequest request
	) {
		return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", exception.getMessage(), request);
	}

	@ExceptionHandler({
			MethodArgumentNotValidException.class,
			ConstraintViolationException.class,
			HandlerMethodValidationException.class,
			MethodArgumentTypeMismatchException.class,
			HttpMessageNotReadableException.class
	})
	public ResponseEntity<ErrorResponse> handleBadRequest(Exception exception, HttpServletRequest request) {
		return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "요청 파라미터를 확인해 주세요.", request);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleUnexpected(Exception exception, HttpServletRequest request) {
		return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.", request);
	}

	private ResponseEntity<ErrorResponse> build(
			HttpStatus status,
			String code,
			String message,
			HttpServletRequest request
	) {
		return ResponseEntity
				.status(status)
				.body(ErrorResponse.of(code, message, status.value(), request.getRequestURI()));
	}
}
