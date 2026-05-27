package com.localbizradar.api.sync.parser;

import java.util.List;

public record StoreCsvParseResult(
		int totalRows,
		List<StoreCsvRow> rows,
		List<StoreCsvParseError> errors
) {
}
