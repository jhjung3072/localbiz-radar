package com.localbizradar.api.sync.repository;

import java.util.Optional;

import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SyncLogRepository extends JpaRepository<SyncLog, Long>, JpaSpecificationExecutor<SyncLog> {

	Optional<SyncLog> findFirstBySyncTypeOrderByStartedAtDesc(SyncType syncType);

	boolean existsBySyncTypeAndStatus(SyncType syncType, com.localbizradar.api.sync.domain.SyncStatus status);
}
