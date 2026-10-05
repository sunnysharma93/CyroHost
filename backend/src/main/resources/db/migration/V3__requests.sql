ALTER TABLE users
    ADD COLUMN platform_role VARCHAR(20) NOT NULL DEFAULT 'USER',
    ADD COLUMN last_login_at TIMESTAMPTZ;

CREATE TABLE catalog_plans (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    price_label VARCHAR(32) NOT NULL,
    cpu INTEGER NOT NULL,
    ram_gb INTEGER NOT NULL,
    disk_gb INTEGER NOT NULL,
    transfer VARCHAR(32) NOT NULL,
    port VARCHAR(32) NOT NULL,
    windows_allowed BOOLEAN NOT NULL,
    active BOOLEAN NOT NULL,
    sort_order INTEGER NOT NULL
);

INSERT INTO catalog_plans (id, name, price_label, cpu, ram_gb, disk_gb, transfer, port, windows_allowed, active, sort_order) VALUES
    ('nano', 'Nano', '₹604', 1, 1, 48, '5 TB', '1 Gbps', FALSE, TRUE, 1),
    ('micro', 'Micro', '₹806', 2, 2, 48, '5 TB', '10 Gbps', TRUE, TRUE, 2),
    ('small', 'Small', '₹1,009', 2, 4, 48, '5 TB', '10 Gbps', TRUE, TRUE, 3),
    ('medium', 'Medium', '₹1,590', 4, 8, 48, '2 TB', '10 Gbps', TRUE, TRUE, 4),
    ('large', 'Large', '₹2,168', 4, 16, 48, '10 TB', '10 Gbps', TRUE, TRUE, 5),
    ('xlarge', 'XLarge', '₹2,554', 8, 16, 48, '10 TB', '10 Gbps', TRUE, TRUE, 6),
    ('2xlarge', '2XLarge', '₹3,903', 8, 32, 48, '20 TB', '10 Gbps', TRUE, TRUE, 7),
    ('3xlarge', '3XLarge', '₹4,867', 16, 32, 48, '20 TB', '10 Gbps', TRUE, TRUE, 8),
    ('4xlarge', '4XLarge', '₹7,758', 32, 64, 48, '20 TB', '10 Gbps', TRUE, TRUE, 9);

CREATE TABLE catalog_regions (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    availability VARCHAR(20) NOT NULL,
    note VARCHAR(400) NOT NULL,
    sort_order INTEGER NOT NULL
);

INSERT INTO catalog_regions (id, name, availability, note, sort_order) VALUES
    ('india', 'India', 'ENQUIRY_ONLY', 'Published compute region. The public pages do not name a city. Availability is confirmed with the team.', 1),
    ('singapore', 'Singapore', 'ENQUIRY_ONLY', 'Published compute region. No city-level hall is claimed. Availability is confirmed with the team.', 2),
    ('mumbai', 'Mumbai', 'ENQUIRY_ONLY', 'Network India map name. Availability on request. Not a confirmed instant-deploy VPS city.', 3),
    ('noida', 'Noida', 'ENQUIRY_ONLY', 'Network India map name. Availability on request. Not a confirmed instant-deploy VPS city.', 4),
    ('japan', 'Japan', 'ENQUIRY_ONLY', 'Availability on request. No live CyroHost capacity is published for this location.', 5),
    ('netherlands', 'Netherlands', 'ENQUIRY_ONLY', 'Availability on request. No live CyroHost capacity is published for this location.', 6),
    ('uk', 'UK', 'ENQUIRY_ONLY', 'Availability on request. No live CyroHost capacity is published for this location.', 7),
    ('united-states', 'USA', 'ENQUIRY_ONLY', 'On request. Not instant deploy, and no capacity figure is published.', 8),
    ('canada', 'Canada', 'ENQUIRY_ONLY', 'Availability on request. No live CyroHost capacity is published for this location.', 9),
    ('new-zealand', 'New Zealand', 'ENQUIRY_ONLY', 'Availability on request. No live CyroHost capacity is published for this location.', 10);

CREATE TABLE catalog_operating_systems (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    family VARCHAR(16) NOT NULL,
    note VARCHAR(400) NOT NULL,
    active BOOLEAN NOT NULL,
    sort_order INTEGER NOT NULL
);

INSERT INTO catalog_operating_systems (id, name, family, note, active, sort_order) VALUES
    ('linux', 'Linux', 'linux', 'Listed on every published VPS size. The exact image is confirmed when the request is reviewed.', TRUE, 1),
    ('windows', 'Windows Server', 'windows', 'Listed on every published size except Nano. Availability is confirmed before an order.', TRUE, 2);

CREATE TABLE vps_requests (
    id UUID PRIMARY KEY,
    request_number VARCHAR(24) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users (id),
    account_id UUID NOT NULL REFERENCES accounts (id),
    plan_id VARCHAR(32) NOT NULL REFERENCES catalog_plans (id),
    region_id VARCHAR(40) NOT NULL REFERENCES catalog_regions (id),
    os_id VARCHAR(40) NOT NULL REFERENCES catalog_operating_systems (id),
    server_name VARCHAR(80) NOT NULL,
    hostname VARCHAR(80),
    ssh_public_key VARCHAR(2000),
    admin_username VARCHAR(64),
    additional_requirements VARCHAR(4000),
    status VARCHAR(24) NOT NULL,
    admin_notes VARCHAR(4000),
    email_status VARCHAR(24) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX vps_requests_user_idx ON vps_requests (user_id, created_at DESC);
CREATE INDEX vps_requests_status_idx ON vps_requests (status, created_at DESC);

CREATE TABLE infrastructure_enquiries (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id),
    kind VARCHAR(32) NOT NULL,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(320) NOT NULL,
    company VARCHAR(120),
    region VARCHAR(80),
    budget VARCHAR(80),
    requirement VARCHAR(4000) NOT NULL,
    email_status VARCHAR(24) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX infrastructure_enquiries_user_idx ON infrastructure_enquiries (user_id, created_at DESC);

CREATE TABLE notification_events (
    id UUID PRIMARY KEY,
    kind VARCHAR(40) NOT NULL,
    recipient VARCHAR(320) NOT NULL,
    subject VARCHAR(180) NOT NULL,
    status VARCHAR(24) NOT NULL,
    resource_id VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX notification_events_created_idx ON notification_events (created_at DESC);

ALTER TABLE audit_events ADD COLUMN user_agent VARCHAR(180);
ALTER TABLE support_tickets ADD COLUMN assignee_user_id UUID REFERENCES users (id);
ALTER TABLE support_messages ADD COLUMN internal_note BOOLEAN NOT NULL DEFAULT FALSE;
