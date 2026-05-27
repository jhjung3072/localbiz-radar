ALTER TABLE stores
    ADD COLUMN external_store_id VARCHAR(80),
    ADD COLUMN source_system VARCHAR(50),
    ADD COLUMN last_synced_at TIMESTAMP;

CREATE UNIQUE INDEX uk_stores_external_source
    ON stores (source_system, external_store_id)
    WHERE external_store_id IS NOT NULL
      AND source_system IS NOT NULL;

CREATE INDEX idx_stores_source_system
    ON stores (source_system);
