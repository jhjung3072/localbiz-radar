package com.localbizradar.api.sync.mapper;

import com.localbizradar.api.sync.parser.StoreCsvRow;
import com.localbizradar.api.sync.service.StoreUpsertCommand;

import org.springframework.stereotype.Component;

@Component
public class StoreCsvMapper {

	public StoreUpsertCommand toCommand(StoreCsvRow row, String sourceSystem) {
		return new StoreUpsertCommand(
				row.externalStoreId(),
				sourceSystem,
				row.storeName(),
				row.branchName(),
				row.categoryLargeCode(),
				row.categoryLargeName(),
				row.categoryMediumCode(),
				row.categoryMediumName(),
				row.categorySmallCode(),
				row.categorySmallName(),
				row.sido(),
				row.sigungu(),
				row.dong(),
				row.lotAddress(),
				row.roadAddress(),
				row.latitude(),
				row.longitude(),
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null);
	}
}
