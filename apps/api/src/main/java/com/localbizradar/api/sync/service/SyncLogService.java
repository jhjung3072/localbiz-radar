package com.localbizradar.api.sync.service;

import com.localbizradar.api.common.error.ResourceNotFoundException;
import com.localbizradar.api.common.response.PageResponse;
import com.localbizradar.api.sync.dto.SyncLogDetailResponse;
import com.localbizradar.api.sync.dto.SyncLogListItemResponse;
import com.localbizradar.api.sync.dto.SyncLogSearchRequest;
import com.localbizradar.api.sync.repository.SyncLogRepository;
import com.localbizradar.api.sync.repository.SyncLogSpecifications;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SyncLogService {

	private final SyncLogRepository syncLogRepository;

	public SyncLogService(SyncLogRepository syncLogRepository) {
		this.syncLogRepository = syncLogRepository;
	}

	public PageResponse<SyncLogListItemResponse> getSyncLogs(SyncLogSearchRequest request) {
		Page<SyncLogListItemResponse> page = syncLogRepository
				.findAll(SyncLogSpecifications.bySearchRequest(request), request.toPageable())
				.map(SyncLogListItemResponse::from);

		return PageResponse.from(page);
	}

	public SyncLogDetailResponse getSyncLog(Long id) {
		return syncLogRepository.findById(id)
				.map(SyncLogDetailResponse::from)
				.orElseThrow(() -> new ResourceNotFoundException("동기화 이력을 찾을 수 없습니다."));
	}
}
