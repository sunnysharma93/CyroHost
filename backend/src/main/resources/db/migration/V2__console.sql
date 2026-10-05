ALTER TABLE users
    ADD COLUMN phone VARCHAR(32),
    ADD COLUMN company VARCHAR(120),
    ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata';

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    owner_user_id UUID NOT NULL UNIQUE REFERENCES users (id),
    name VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

INSERT INTO accounts (id, owner_user_id, name, created_at)
SELECT id, id, full_name, created_at FROM users;

CREATE TABLE account_members (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    user_id UUID REFERENCES users (id) ON DELETE SET NULL,
    email VARCHAR(320) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE (account_id, email)
);

CREATE INDEX account_members_user_idx ON account_members (user_id);

INSERT INTO account_members (id, account_id, user_id, email, role, status, created_at)
SELECT gen_random_uuid(),
       id,
       id,
       COALESCE(email, id::text || '@pending.cyrohost.invalid'),
       'OWNER',
       'ACTIVE',
       created_at
FROM users;

CREATE TABLE audit_events (
    id UUID PRIMARY KEY,
    account_id UUID REFERENCES accounts (id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    resource_type VARCHAR(40) NOT NULL,
    resource_id VARCHAR(80),
    metadata VARCHAR(1000),
    ip VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX audit_events_account_idx ON audit_events (account_id, created_at DESC);

CREATE TABLE servers (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    hostname VARCHAR(80) NOT NULL,
    plan_code VARCHAR(32) NOT NULL,
    region_code VARCHAR(32) NOT NULL,
    os_family VARCHAR(16) NOT NULL,
    status VARCHAR(32) NOT NULL,
    ssh_public_key VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX servers_account_idx ON servers (account_id, created_at DESC);

CREATE TABLE server_groups (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE (account_id, name)
);

CREATE TABLE server_group_members (
    group_id UUID NOT NULL REFERENCES server_groups (id) ON DELETE CASCADE,
    server_id UUID NOT NULL REFERENCES servers (id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, server_id)
);

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    subject VARCHAR(160) NOT NULL,
    category VARCHAR(40) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX support_tickets_account_idx ON support_tickets (account_id, updated_at DESC);

CREATE TABLE support_messages (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets (id) ON DELETE CASCADE,
    author_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
    body VARCHAR(4000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX support_messages_ticket_idx ON support_messages (ticket_id, created_at);

CREATE TABLE api_tokens (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users (id),
    name VARCHAR(80) NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    token_prefix VARCHAR(20) NOT NULL,
    scopes VARCHAR(200) NOT NULL,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX api_tokens_account_idx ON api_tokens (account_id, created_at DESC);

CREATE TABLE dns_zones (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    name VARCHAR(253) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE (account_id, name)
);

CREATE TABLE dns_records (
    id UUID PRIMARY KEY,
    zone_id UUID NOT NULL REFERENCES dns_zones (id) ON DELETE CASCADE,
    record_type VARCHAR(8) NOT NULL,
    host VARCHAR(253) NOT NULL,
    record_value VARCHAR(1024) NOT NULL,
    ttl INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX dns_records_zone_idx ON dns_records (zone_id);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    number VARCHAR(40) NOT NULL UNIQUE,
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(8) NOT NULL,
    status VARCHAR(20) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX invoices_account_idx ON invoices (account_id, issued_at DESC);

CREATE TABLE offers (
    id UUID PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL,
    eligibility VARCHAR(300),
    active BOOLEAN NOT NULL,
    expires_at TIMESTAMPTZ
);
