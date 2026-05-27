package com.localbizradar.api.sync.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class SyncLogSearchRequest {

	@Min(0)
	private int page = 0;

	@Min(1)
	@Max(100)
	private int size = 10;

	private SyncStatus status;

	private SyncType syncType;

	public int getPage() {
		return page;
	}

	public void setPage(int page) {
		this.page = page;
	}

	public int getSize() {
		return size;
	}

	public void setSize(int size) {
		this.size = Math.min(size, 100);
	}

	public SyncStatus getStatus() {
		return status;
	}

	public void setStatus(SyncStatus status) {
		this.status = status;
	}

	public SyncType getSyncType() {
		return syncType;
	}

	public void setSyncType(SyncType syncType) {
		this.syncType = syncType;
	}

	public Pageable toPageable() {
		return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startedAt"));
	}
}
