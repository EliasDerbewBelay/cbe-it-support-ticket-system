-- ============================================================================
-- CBE IT SUPPORT TICKET MANAGEMENT SYSTEM
-- PostgreSQL Database DDL Schema
-- Database: cbe-it-support-system-db
-- Target: PostgreSQL 14+ / Compatible with pgAdmin 4 & Prisma ORM
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. SEQUENCES
-- ----------------------------------------------------------------------------
-- Sequence for generating human-readable sequential ticket numbers (TKT-000001, etc.)
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
-- 4. TRIGGER FUNCTION: AUTO-UPDATE updated_at TIMESTAMP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 5. TABLES CREATION (IN LOGICAL DEPENDENCY ORDER)
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- Table 1: departments
-- Represents organizational branches, directorates, and units within CBE.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE departments IS 'Organizational departments, branches, and divisions within Commercial Bank of Ethiopia';
COMMENT ON COLUMN departments.id IS 'Primary key surrogate UUID';
COMMENT ON COLUMN departments.name IS 'Unique official name of the department';
COMMENT ON COLUMN departments.is_active IS 'Soft-deactivation flag; false prevents new ticket submissions for this dept';

-- ----------------------------------------------------------------------------
-- Table 2: users
-- Single consolidated user repository for Employees, Technicians, and Admins.
-- ----------------------------------------------------------------------------
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

COMMENT ON TABLE users IS 'Consolidated authentication and profile store for all application roles';
COMMENT ON COLUMN users.password_hash IS 'Salted cryptographic password hash (bcrypt / argon2id); plaintext prohibited';
COMMENT ON COLUMN users.role IS 'Role-Based Access Control classification (EMPLOYEE, TECHNICIAN, ADMINISTRATOR)';
COMMENT ON COLUMN users.employee_id IS 'Institutional CBE Staff / Badge identification number';
COMMENT ON COLUMN users.is_active IS 'Soft-deactivation flag; false prohibits authentication';

-- ----------------------------------------------------------------------------
-- Table 3: categories
-- Database-managed IT support problem classifications.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE categories IS 'Classifications of IT support incidents manageable dynamically by administrators';
COMMENT ON COLUMN categories.is_active IS 'Soft-deactivation flag; false hides category from submission dropdowns';

-- ----------------------------------------------------------------------------
-- Table 4: tickets
-- Central entity tracking IT incidents, statuses, priorities, and resolutions.
-- ----------------------------------------------------------------------------
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

COMMENT ON TABLE tickets IS 'Core incident ticket entity tracking customer IT support requests';
COMMENT ON COLUMN tickets.ticket_number IS 'Human-readable formatted sequential ticket ID (e.g., TKT-000001)';
COMMENT ON COLUMN tickets.department_id IS 'Requesting department snapshotted at time of ticket creation';
COMMENT ON COLUMN tickets.resolution IS 'Mandatory explanation of the corrective action taken to resolve the incident';

-- ----------------------------------------------------------------------------
-- Table 5: ticket_assignments
-- Captures technician assignment and reassignment audit history.
-- ----------------------------------------------------------------------------
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

COMMENT ON TABLE ticket_assignments IS 'Chronological audit trail of technician dispatches and reassignments';
COMMENT ON COLUMN ticket_assignments.is_current IS 'True if this is the active technician assignment for the ticket';

-- ----------------------------------------------------------------------------
-- Table 6: ticket_comments
-- Threaded user dialogue and internal technical troubleshooting notes.
-- ----------------------------------------------------------------------------
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

COMMENT ON TABLE ticket_comments IS 'Communication log for public dialogue and internal technician diagnostic notes';
COMMENT ON COLUMN ticket_comments.is_internal IS 'If true, restricted to Technicians and Administrators; hidden from Employees';

-- ----------------------------------------------------------------------------
-- Table 7: ticket_status_history
-- Append-only audit trail capturing every ticket lifecycle state change.
-- ----------------------------------------------------------------------------
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

COMMENT ON TABLE ticket_status_history IS 'Append-only audit trail recording every ticket lifecycle state transition';
COMMENT ON COLUMN ticket_status_history.previous_status IS 'Null on initial ticket submission';

-- ----------------------------------------------------------------------------
-- 6. PERFORMANCE & COMPOSITE INDEXES
-- ----------------------------------------------------------------------------

-- Indexes on users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Indexes on departments & categories
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON departments(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Indexes on tickets (optimized for employee, technician, and admin views)
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_employee_id ON tickets(employee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_department_id ON tickets(department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category_id ON tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- Indexes on ticket_assignments
CREATE INDEX IF NOT EXISTS idx_assignments_ticket_id ON ticket_assignments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_assignments_technician ON ticket_assignments(technician_id, is_current);

-- Indexes on ticket_comments
CREATE INDEX IF NOT EXISTS idx_comments_ticket_internal ON ticket_comments(ticket_id, is_internal);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON ticket_comments(author_id);

-- Indexes on ticket_status_history
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
