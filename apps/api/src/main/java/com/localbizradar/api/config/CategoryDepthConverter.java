package com.localbizradar.api.config;

import java.util.Locale;

import com.localbizradar.api.analysis.dto.CategoryDepth;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class CategoryDepthConverter implements Converter<String, CategoryDepth> {

	@Override
	public CategoryDepth convert(String source) {
		return CategoryDepth.valueOf(source.trim().toUpperCase(Locale.ROOT));
	}
}
