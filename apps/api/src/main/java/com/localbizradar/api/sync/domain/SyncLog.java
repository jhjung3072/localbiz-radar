package com.localbizradar.api.sync.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "sync_logs")
public class SyncLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "sync_type", nullable = false, length = 50)
	private SyncType syncType;

	@Column(name = "source_name", nullable = false)
	private String sourceName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private SyncStatus status;

	@Column(name = "dry_run", nullable = false)
	private boolean dryRun;

	@Column(name = "total_rows", nullable = false)
	private int totalRows;

	@Column(name = "success_rows", nullable = false)
	private int successRows;

	@Column(name = "failed_rows", nullable = false)
	private int failedRows;

	@Column(name = "skipped_rows", nullable = false)
	private int skippedRows;

	@Column(name = "started_at", nullable = false)
	private LocalDateTime startedAt;

	@Column(name = "finished_at")
	private LocalDateTime finishedAt;

	@Column(length = 500)
	private String message;

	@Column(name = "error_summary", columnDefinition = "text")
	private String errorSummary;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	protected SyncLog() {
	}

	public static SyncLog start(StoreCsvImportStart start) {
		LocalDateTime now = start.startedAt();
		SyncLog syncLog = new SyncLog();
		syncLog.syncType = SyncType.STORE_CSV_IMPORT;
		syncLog.sourceName = start.sourceName();
		syncLog.status = SyncStatus.RUNNING;
		syncLog.dryRun = start.dryRun();
		syncLog.startedAt = now;
		syncLog.createdAt = now;
		syncLog.updatedAt = now;
		syncLog.message = "CSV import가 시작되었습니다.";
		return syncLog;
	}

	public void finish(
			SyncStatus status,
			int totalRows,
			int successRows,
			int failedRows,
			int skippedRows,
			String message,
			String errorSummary,
			LocalDateTime finishedAt
	) {
		this.status = status;
		this.totalRows = totalRows;
		this.successRows = successRows;
		this.failedRows = failedRows;
		this.skippedRows = skippedRows;
		this.message = message;
		this.errorSummary = errorSummary;
		this.finishedAt = finishedAt;
		this.updatedAt = finishedAt;
	}

	public Long getId() {
		return id;
	}

	public SyncType getSyncType() {
		return syncType;
	}

	public String getSourceName() {
		return sourceName;
	}

	public SyncStatus getStatus() {
		return status;
	}

	public boolean isDryRun() {
		return dryRun;
	}

	public int getTotalRows() {
		return totalRows;
	}

	public int getSuccessRows() {
		return successRows;
	}

	public int getFailedRows() {
		return failedRows;
	}

	public int getSkippedRows() {
		return skippedRows;
	}

	public LocalDateTime getStartedAt() {
		return startedAt;
	}

	public LocalDateTime getFinishedAt() {
		return finishedAt;
	}

	public String getMessage() {
		return message;
	}

	public String getErrorSummary() {
		return errorSummary;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public record StoreCsvImportStart(String sourceName, boolean dryRun, LocalDateTime startedAt) {
	}
}
