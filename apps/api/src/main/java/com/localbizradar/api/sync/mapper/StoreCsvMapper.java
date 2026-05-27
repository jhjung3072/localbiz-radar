package com.localbizradar.api.sync.mapper;

import java.time.LocalDateTime;

import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.sync.parser.StoreCsvRow;

import org.springframework.stereotype.Component;

@Component
public class StoreCsvMapper {

	public Store toNewStore(StoreCsvRow row, String sourceSystem, LocalDateTime syncedAt) {
		return Store.createImported(
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
				syncedAt);
	}

	public void updateStore(Store store, StoreCsvRow row, LocalDateTime syncedAt) {
		store.updateImported(
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
				syncedAt);
	}
}
