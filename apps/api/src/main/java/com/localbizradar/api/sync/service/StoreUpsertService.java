package com.localbizradar.api.sync.service;

import java.time.LocalDateTime;

import com.localbizradar.api.store.domain.Store;
import com.localbizradar.api.store.repository.StoreRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StoreUpsertService {

	private final StoreRepository storeRepository;

	public StoreUpsertService(StoreRepository storeRepository) {
		this.storeRepository = storeRepository;
	}

	public StoreUpsertResult upsert(StoreUpsertCommand command, LocalDateTime syncedAt) {
		Store store = storeRepository
				.findBySourceSystemAndExternalStoreId(command.sourceSystem(), command.externalStoreId())
				.orElse(null);
		boolean inserted = store == null;

		if (inserted) {
			store = Store.createImported(
					command.externalStoreId(),
					command.sourceSystem(),
					command.storeName(),
					command.branchName(),
					command.categoryLargeCode(),
					command.categoryLargeName(),
					command.categoryMediumCode(),
					command.categoryMediumName(),
					command.categorySmallCode(),
					command.categorySmallName(),
					command.sido(),
					command.sidoCode(),
					command.sigungu(),
					command.sigunguCode(),
					command.dong(),
					command.adminDongCode(),
					command.legalDongCode(),
					command.legalDongName(),
					command.pnuCode(),
					command.lotAddress(),
					command.roadAddress(),
					command.buildingManagementNumber(),
					command.latitude(),
					command.longitude(),
					command.changeType(),
					command.changedAt(),
					syncedAt);
		} else {
			store.updateImported(
					command.storeName(),
					command.branchName(),
					command.categoryLargeCode(),
					command.categoryLargeName(),
					command.categoryMediumCode(),
					command.categoryMediumName(),
					command.categorySmallCode(),
					command.categorySmallName(),
					command.sido(),
					command.sidoCode(),
					command.sigungu(),
					command.sigunguCode(),
					command.dong(),
					command.adminDongCode(),
					command.legalDongCode(),
					command.legalDongName(),
					command.pnuCode(),
					command.lotAddress(),
					command.roadAddress(),
					command.buildingManagementNumber(),
					command.latitude(),
					command.longitude(),
					command.changeType(),
					command.changedAt(),
					syncedAt);
		}

		storeRepository.save(store);
		return new StoreUpsertResult(inserted);
	}
}
