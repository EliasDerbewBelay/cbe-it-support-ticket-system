-- ============================================================================
-- CBE IT SUPPORT TICKET MANAGEMENT SYSTEM
-- Development Reference Seed Data
-- Database: cbe-it-support-system-db
-- Target: PostgreSQL 14+ / Compatible with pgAdmin 4
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SEED DEPARTMENTS
-- ----------------------------------------------------------------------------
INSERT INTO departments (id, name, description, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Information Systems', 'IT Infrastructure, Systems Support & Helpdesk', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Finance & Accounts', 'Financial Planning, Budgeting and Payroll Operations', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Human Resources', 'Talent Acquisition, Employee Relations and Personnel', TRUE),
    ('44444444-4444-4444-4444-444444444444', 'Retail Banking', 'Branch Banking, Customer Accounts and Counter Services', TRUE),
    ('55555555-5555-5555-5555-555555555555', 'Operations & Clearing', 'Cheque Clearing, Swift Services and Reconciliation', TRUE),
    ('66666666-6666-6666-6666-666666666666', 'Customer Service', 'Call Centre, Help Desk and Inquiries Management', TRUE)
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. SEED CATEGORIES
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 3. SEED DEVELOPMENT USERS
-- Password for all seed users is: Password@123 (bcrypt cost factor 12)
-- Password hash: $2b$12$zIwcCxZBxOzVi7ZTQqUucOqlD06bG.0B4Hf2lRe/ZleihxaBIF1ui
-- ----------------------------------------------------------------------------
INSERT INTO users (id, first_name, last_name, email, password_hash, role, department_id, employee_id, phone_number, is_active) VALUES
    (
        'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Abebe',
        'Admin',
        'admin.is@cbe.com.et',
        '$2b$12$zIwcCxZBxOzVi7ZTQqUucOqlD06bG.0B4Hf2lRe/ZleihxaBIF1ui',
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
        '$2b$12$zIwcCxZBxOzVi7ZTQqUucOqlD06bG.0B4Hf2lRe/ZleihxaBIF1ui',
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
        '$2b$12$zIwcCxZBxOzVi7ZTQqUucOqlD06bG.0B4Hf2lRe/ZleihxaBIF1ui',
        'EMPLOYEE',
        '22222222-2222-2222-2222-222222222222',
        'CBE-EMP-003',
        '+251-11-551-0003',
        TRUE
    )
ON CONFLICT (email) DO NOTHING;
