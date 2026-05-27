package com.localbizradar.api.sync.parser;

public record StoreCsvParseError(long rowNumber, String message) {
}
