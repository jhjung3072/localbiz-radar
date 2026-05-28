package com.localbizradar.api.sync.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.localbizradar.api.sync.domain.SyncLog;
import com.localbizradar.api.sync.domain.SyncStatus;
import com.localbizradar.api.sync.domain.SyncType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SyncLogRepository extends JpaRepository<SyncLog, Long>, JpaSpecificationExecutor<SyncLog> {

	Optional<SyncLog> findFirstBySyncTypeOrderByStartedAtDesc(SyncType syncType);

	Optional<SyncLog> findFirstByOrderByStartedAtDesc();

	boolean existsBySyncTypeAndStatus(SyncType syncType, com.localbizradar.api.sync.domain.SyncStatus status);

	long countByStatusAndStartedAtGreaterThanEqual(SyncStatus status, LocalDateTime startedAt);

	List<SyncLog> findByStartedAtGreaterThanEqual(LocalDateTime startedAt);

	List<SyncLog> findTop5ByStatusAndFinishedAtGreaterThanEqualOrderByFinishedAtDesc(
			SyncStatus status,
			LocalDateTime finishedAt
	);
}
