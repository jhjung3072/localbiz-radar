CREATE TABLE regions (
    id BIGSERIAL PRIMARY KEY,
    sido_code VARCHAR(10) NOT NULL,
    sido_name VARCHAR(50) NOT NULL,
    sigungu_code VARCHAR(10) NOT NULL,
    sigungu_name VARCHAR(50) NOT NULL,
    dong_code VARCHAR(20) NOT NULL,
    dong_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE stores (
    id BIGSERIAL PRIMARY KEY,
    store_name VARCHAR(120) NOT NULL,
    branch_name VARCHAR(120),
    category_large_code VARCHAR(20) NOT NULL,
    category_large_name VARCHAR(80) NOT NULL,
    category_medium_code VARCHAR(20) NOT NULL,
    category_medium_name VARCHAR(80) NOT NULL,
    category_small_code VARCHAR(20) NOT NULL,
    category_small_name VARCHAR(80) NOT NULL,
    sido VARCHAR(50) NOT NULL,
    sigungu VARCHAR(50) NOT NULL,
    dong VARCHAR(50) NOT NULL,
    lot_address VARCHAR(255),
    road_address VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uk_regions_hierarchy
    ON regions (sido_code, sigungu_code, dong_code);

CREATE INDEX idx_regions_names
    ON regions (sido_name, sigungu_name, dong_name);

CREATE INDEX idx_stores_region
    ON stores (sido, sigungu, dong);

CREATE INDEX idx_stores_category
    ON stores (category_large_code, category_medium_code, category_small_code);

CREATE INDEX idx_stores_store_name
    ON stores (store_name);
