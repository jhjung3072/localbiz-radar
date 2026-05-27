create table region_masters (
    id bigserial primary key,
    region_type varchar(20) not null,
    ctprvn_cd varchar(10),
    ctprvn_nm varchar(80),
    signgu_cd varchar(10),
    signgu_nm varchar(80),
    adong_cd varchar(20),
    adong_nm varchar(80),
    ldong_cd varchar(20),
    ldong_nm varchar(80),
    parent_code varchar(20),
    code varchar(20) not null,
    name varchar(80) not null,
    standard_date date,
    source_system varchar(50) not null,
    last_synced_at timestamp,
    created_at timestamp not null,
    updated_at timestamp not null
);

create unique index ux_region_masters_type_code
    on region_masters (region_type, code);

create index ix_region_masters_type_parent
    on region_masters (region_type, parent_code);

create table category_masters (
    id bigserial primary key,
    category_level varchar(20) not null,
    inds_lcls_cd varchar(20),
    inds_lcls_nm varchar(80),
    inds_mcls_cd varchar(20),
    inds_mcls_nm varchar(80),
    inds_scls_cd varchar(20),
    inds_scls_nm varchar(80),
    parent_code varchar(20),
    code varchar(20) not null,
    name varchar(80) not null,
    standard_date date,
    source_system varchar(50) not null,
    last_synced_at timestamp,
    created_at timestamp not null,
    updated_at timestamp not null
);

create unique index ux_category_masters_level_code
    on category_masters (category_level, code);

create index ix_category_masters_level_parent
    on category_masters (category_level, parent_code);
