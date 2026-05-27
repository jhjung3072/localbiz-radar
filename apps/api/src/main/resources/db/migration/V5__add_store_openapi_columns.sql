ALTER TABLE stores
    ADD COLUMN sido_code VARCHAR(10),
    ADD COLUMN sigungu_code VARCHAR(10),
    ADD COLUMN admin_dong_code VARCHAR(20),
    ADD COLUMN legal_dong_code VARCHAR(20),
    ADD COLUMN legal_dong_name VARCHAR(50),
    ADD COLUMN pnu_code VARCHAR(30),
    ADD COLUMN building_management_number VARCHAR(40),
    ADD COLUMN change_type VARCHAR(20),
    ADD COLUMN changed_at DATE;

CREATE INDEX idx_stores_region_codes
    ON stores (sido_code, sigungu_code, admin_dong_code);
