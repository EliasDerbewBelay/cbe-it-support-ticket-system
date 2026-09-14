-- ============================================================================
-- CBE IT SUPPORT TICKET MANAGEMENT SYSTEM
-- Complete PostgreSQL DDL Schema & Reference Seed Script
-- Target Database: cbe-it-support-system-db
-- Target Engine: PostgreSQL 14+
-- Development Tool: pgAdmin 4
-- ORM Compatibility: Prisma ORM Compatible
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. SEQUENCES
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ----------------------------------------------------------------------------
-- 3. ENUM TYPES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'EMPLOYEE',
            'TECHNICIAN',
            'ADMINISTRATOR'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
        CREATE TYPE ticket_status AS ENUM (
            'OPEN',
            'ASSIGNED',
            'IN_PROGRESS',
            'RESOLVED',
            'CLOSED',
            'CANCELLED'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
        CREATE TYPE ticket_priority AS ENUM (
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL'
        );
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. TRIGGER FUNCTION: update_timestamp_column
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 5. TABLES CREATION
-- ----------------------------------------------------------------------------

-- Table 1: departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    department_id UUID NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    phone_number VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_users_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table 3: categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: tickets
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) NOT NULL UNIQUE DEFAULT ('TKT-' || LPAD(nextval('ticket_number_seq')::text, 6, '0')),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'MEDIUM',
    status ticket_status NOT NULL DEFAULT 'OPEN',
    employee_id UUID NOT NULL,
    department_id UUID NOT NULL,
    resolution TEXT,
    resolved_by UUID,
    closed_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    CONSTRAINT fk_tickets_category
        FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_tickets_employee
        FOREIGN KEY (employee_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_tickets_department
        FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_tickets_resolved_by
        FOREIGN KEY (resolved_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_tickets_closed_by
        FOREIGN KEY (closed_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_tickets_resolution_required
        CHECK (status NOT IN ('RESOLVED', 'CLOSED') OR (resolution IS NOT NULL AND LENGTH(TRIM(resolution)) > 0)),
    CONSTRAINT chk_tickets_timestamps
        CHECK (
            (resolved_at IS NULL OR resolved_at >= created_at) AND
            (closed_at IS NULL OR closed_at >= created_at)
        )
);

-- Table 5: ticket_assignments
CREATE TABLE IF NOT EXISTS ticket_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    technician_id UUID NOT NULL,
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMPTZ,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    CONSTRAINT fk_assignments_ticket
        FOREIGN KEY (ticket_id) 
        REFERENCES tickets(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_technician
        FOREIGN KEY (technician_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_assigned_by
        FOREIGN KEY (assigned_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_assignments_timeline
        CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at)
);

-- Table 6: ticket_comments
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_ticket
        FOREIGN KEY (ticket_id) 
        REFERENCES tickets(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_comments_author
        FOREIGN KEY (author_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Table 7: ticket_status_history
CREATE TABLE IF NOT EXISTS ticket_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    changed_by UUID NOT NULL,
    previous_status ticket_status,
    new_status ticket_status NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    CONSTRAINT fk_status_history_ticket
        FOREIGN KEY (ticket_id) 
        REFERENCES tickets(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_status_history_changed_by
        FOREIGN KEY (changed_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 6. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_departments_is_active ON departments(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_employee_id ON tickets(employee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_department_id ON tickets(department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category_id ON tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assignments_ticket_id ON ticket_assignments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_assignments_technician ON ticket_assignments(technician_id, is_current);

CREATE INDEX IF NOT EXISTS idx_comments_ticket_internal ON ticket_comments(ticket_id, is_internal);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON ticket_comments(author_id);

CREATE INDEX IF NOT EXISTS idx_status_history_ticket ON ticket_status_history(ticket_id, changed_at ASC);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_by ON ticket_status_history(changed_by);

-- ----------------------------------------------------------------------------
-- 7. TRIGGERS FOR AUTO-UPDATING updated_at
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets;
CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_comments_updated_at ON ticket_comments;
CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- ----------------------------------------------------------------------------
-- 8. REFERENCE SEED DATA
-- ----------------------------------------------------------------------------

-- Seed Departments
INSERT INTO departments (id, name, description, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Information Systems', 'IT Infrastructure, Systems Support & Helpdesk', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Finance & Accounts', 'Financial Planning, Budgeting and Payroll Operations', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Human Resources', 'Talent Acquisition, Employee Relations and Personnel', TRUE),
    ('44444444-4444-4444-4444-444444444444', 'Retail Banking', 'Branch Banking, Customer Accounts and Counter Services', TRUE),
    ('55555555-5555-5555-5555-555555555555', 'Operations & Clearing', 'Cheque Clearing, Swift Services and Reconciliation', TRUE),
    ('66666666-6666-6666-6666-666666666666', 'Customer Service', 'Call Centre, Help Desk and Inquiries Management', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Seed Categories
INSERT INTO categories (id, name, description, is_active) VALUES
    ('a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HARDWARE', 'Desktop PC, Monitor, Scanner, or Peripheral Malfunction', TRUE),
    ('a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SOFTWARE', 'Operating System, Office Suite, or Banking Client Error', TRUE),
    ('a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NETWORK', 'LAN Connectivity, Wi-Fi, VPN, or Gateway Unreachable', TRUE),
    ('a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PRINTER', 'Receipt Printer, Passbook Printer, or Heavy Duty Unit Failure', TRUE),
    ('a5555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EMAIL', 'Institutional Mailbox Configuration, Quota, or Sync Issue', TRUE),
    ('a6666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SYSTEM_ACCESS', 'Active Directory, Shared Folder, or Portal Permissions', TRUE),
    ('a7777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ACCOUNT', 'Password Reset, Account Lockout, or Credential Renewal', TRUE),
    ('a8888888-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SECURITY', 'Suspected Phishing, Antivirus Alert, or Unauthorized Device', TRUE),
    ('a9999999-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'OTHER', 'Uncategorized or General IT Inquiries', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Seed Development Users (Password: Password@123)
INSERT INTO users (id, first_name, last_name, email, password_hash, role, department_id, employee_id, phone_number, is_active) VALUES
    (
        'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Abebe',
        'Admin',
        'admin.is@cbe.com.et',
        '$2b$12$e8kPq1oZk1wZ1N6eK5Z1eO1q5cQJ6/Q5Lz8s8L0zG0sJ1k5y6L2rS',
        'ADMINISTRATOR',
        '11111111-1111-1111-1111-111111111111',
        'CBE-EMP-001',
        '+251-11-551-0001',
        TRUE
    ),
    (
        'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Tadesse',
        'Tech',
        'tech.support@cbe.com.et',
        '$2b$12$e8kPq1oZk1wZ1N6eK5Z1eO1q5cQJ6/Q5Lz8s8L0zG0sJ1k5y6L2rS',
        'TECHNICIAN',
        '11111111-1111-1111-1111-111111111111',
        'CBE-EMP-002',
        '+251-11-551-0002',
        TRUE
    ),
    (
        'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Chaltu',
        'Employee',
        'chaltu.finance@cbe.com.et',
        '$2b$12$e8kPq1oZk1wZ1N6eK5Z1eO1q5cQJ6/Q5Lz8s8L0zG0sJ1k5y6L2rS',
        'EMPLOYEE',
        '22222222-2222-2222-2222-222222222222',
        'CBE-EMP-003',
        '+251-11-551-0003',
        TRUE
    )
ON CONFLICT (email) DO NOTHING;
