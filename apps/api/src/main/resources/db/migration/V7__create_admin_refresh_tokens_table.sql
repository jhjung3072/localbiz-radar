create table admin_refresh_tokens (
    id bigserial primary key,
    token_id varchar(80) not null,
    username varchar(80) not null,
    token_hash varchar(120) not null,
    issued_at timestamp not null,
    expires_at timestamp not null,
    revoked_at timestamp,
    replaced_by_token_id varchar(80),
    user_agent varchar(500),
    ip_address varchar(80),
    created_at timestamp not null,
    updated_at timestamp not null
);

create unique index ux_admin_refresh_tokens_token_id
    on admin_refresh_tokens (token_id);

create index ix_admin_refresh_tokens_username
    on admin_refresh_tokens (username);

create index ix_admin_refresh_tokens_expires_at
    on admin_refresh_tokens (expires_at);

create index ix_admin_refresh_tokens_revoked_at
    on admin_refresh_tokens (revoked_at);
