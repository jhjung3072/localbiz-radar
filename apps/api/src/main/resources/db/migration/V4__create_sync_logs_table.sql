CREATE TABLE sync_logs (
    id BIGSERIAL PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    dry_run BOOLEAN NOT NULL,
    total_rows INTEGER NOT NULL DEFAULT 0,
    success_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    skipped_rows INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    message VARCHAR(500),
    error_summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_started_at
    ON sync_logs (started_at DESC);

CREATE INDEX idx_sync_logs_type_status
    ON sync_logs (sync_type, status);
