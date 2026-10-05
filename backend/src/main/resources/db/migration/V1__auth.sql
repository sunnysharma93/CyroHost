CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(80) NOT NULL,
    email VARCHAR(320) UNIQUE,
    password_hash VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE refresh_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    replaced_by UUID,
    remember_me BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX refresh_sessions_user_id_idx ON refresh_sessions (user_id);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE identity_accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    email_at_provider VARCHAR(320),
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE (provider, provider_subject)
);

CREATE TABLE oauth_transactions (
    id UUID PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    state_hash VARCHAR(64) NOT NULL UNIQUE,
    nonce_hash VARCHAR(64) NOT NULL,
    verifier_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);
