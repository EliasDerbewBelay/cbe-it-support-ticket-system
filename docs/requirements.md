# Requirements Specification: CBE IT Support Ticket Management System

> **Document Status:** Complete / Architectural Baseline (Phase 1)  
> **Standard:** IEEE 830 / Agile Feature Specification  

---

## 1. System Stakeholders and Actors

| Actor | Description | Primary Goal |
| :--- | :--- | :--- |
| **Employee** | Any authorized CBE staff member outside or within IS who encounters IT disruptions. | Quickly log incidents, track resolution progress, and verify that issues are resolved. |
| **Technician** | An IS support engineer, systems administrator, or hardware specialist assigned to resolve incidents. | View assigned workload, document troubleshooting steps, diagnose root causes, and submit resolutions. |
| **Administrator** | An IS helpdesk manager or department head responsible for overall IT service quality. | Oversee queue health, assign technicians, configure users/departments/categories, and generate analytics. |

---

## 2. Functional Requirements (FR)

### 2.1 Module 1: Authentication & Identity Management
* **FR-AUTH-01:** The system shall authenticate users using a unique organizational email or Staff ID and a hashed password.
* **FR-AUTH-02:** Upon successful authentication, the backend shall issue a cryptographically signed JSON Web Token (JWT) containing the user’s unique identifier (`id`), email, and `role`.
* **FR-AUTH-03:** The system shall restrict subsequent authenticated API calls based on token claims and active account status (`isActive == true`).
* **FR-AUTH-04:** The system shall provide an endpoint (`GET /api/auth/me`) allowing client sessions to hydrate current user profile and role details.
* **FR-AUTH-05:** Passwords must be hashed using `bcrypt` (work factor >= 12) or `argon2id` prior to persistence. Plaintext passwords must never be logged or transmitted in responses.

### 2.2 Module 2: Employee Portal & Ticket Submission
* **FR-EMP-01:** Authenticated employees shall access a dashboard displaying a summary of their submitted tickets (Total, Active, Resolved, Closed).
* **FR-EMP-02:** An employee shall create an incident ticket by providing:
  * **Title:** Concise summary of the incident (10 to 150 characters).
  * **Description:** Detailed explanation of the technical failure, error messages, and reproduction steps (minimum 20 characters).
  * **Category:** Selection from active administrative categories (e.g., HARDWARE, NETWORK, SOFTWARE).
  * **Priority:** Initial perceived priority (LOW, MEDIUM, HIGH; CRITICAL is reserved or flagged for triage).
* **FR-EMP-03:** The system shall automatically bind the employee's `id` and their associated `departmentId` to the ticket upon creation.
* **FR-EMP-04:** Newly created tickets shall automatically default to the `OPEN` state.
* **FR-EMP-05:** Employees shall only view their own submitted tickets. Queries must enforce `WHERE employeeId = currentUserId`.
* **FR-EMP-06:** An employee can cancel their ticket only if it remains in the `OPEN` state and has not been picked up or assigned.
* **FR-EMP-07:** An employee may add public communication notes/comments to their own tickets.

### 2.3 Module 3: Technician Workspace & Incident Handling
* **FR-TECH-01:** Technicians shall access a personalized queue displaying tickets assigned to them across `ASSIGNED` and `IN_PROGRESS` states.
* **FR-TECH-02:** A technician shall transition an assigned ticket from `ASSIGNED` to `IN_PROGRESS` to signal active investigation.
* **FR-TECH-03:** A technician shall add **internal troubleshooting notes** (`isInternal = true`) invisible to employees, recording diagnostic steps, internal IP addresses, vendor ticket numbers, or component serials.
* **FR-TECH-04:** A technician can post public updates (`isInternal = false`) visible to the employee.
* **FR-TECH-05:** A technician shall transition a ticket to `RESOLVED` only after submitting mandatory **Resolution Notes** detailing the corrective action taken.
* **FR-TECH-06:** Technicians shall not view or update tickets assigned to other technicians unless an administrator reassigns the ticket.

### 2.4 Module 4: Administrator Management & Dispatching
* **FR-ADM-01:** Administrators shall view a global ticket console with multidimensional filtering (by status, priority, category, department, technician, date range).
* **FR-ADM-02:** Administrators shall assign an `OPEN` or unassigned ticket to an active technician, automatically transitioning status to `ASSIGNED`.
* **FR-ADM-03:** Administrators shall have permission to reassign tickets between technicians, documenting a reason for audit tracking.
* **FR-ADM-04:** Administrators shall manage User accounts: create users, assign roles, assign departments, and toggle active status (`isActive`). Hard deletion of users with historical activity is prohibited.
* **FR-ADM-05:** Administrators shall manage Departments: create department entries, update codes/names, and toggle active status.
* **FR-ADM-06:** Administrators shall manage Categories: create ticket categories, update labels/descriptions, and toggle active status.
* **FR-ADM-07:** Administrators can formally transition a `RESOLVED` ticket to `CLOSED` after confirming operational verification.
* **FR-ADM-08:** Administrators shall access aggregated reports and metrics.

### 2.5 Module 5: Auditability & Status History
* **FR-HIS-01:** Any transition of a ticket's status (`status` attribute) shall trigger an atomic insertion of a `TicketStatusHistory` record within the same database transaction.
* **FR-HIS-02:** The history record must capture: `ticketId`, `changedById`, `previousStatus`, `newStatus`, `reason` (optional or mandatory depending on transition), and timestamp `createdAt`.
* **FR-HIS-03:** The history log shall be strictly append-only; update and delete operations on `TicketStatusHistory` are prohibited.

---

## 3. Non-Functional Requirements (NFR)

### 3.1 Security & Compliance (NFR-SEC)
* **NFR-SEC-01 (Principle of Least Privilege):** The Express API must enforce role-based access control at the route and service levels. Unauthorized route attempts must return HTTP `403 Forbidden`.
* **NFR-SEC-02 (Input Validation & Sanitization):** All incoming payloads must be validated against strict schemas (e.g., Zod). Unrecognized payload properties must be stripped.
* **NFR-SEC-03 (SQL Injection Prevention):** All queries must execute via Prisma ORM parameterized queries. Raw unescaped SQL execution is forbidden.
* **NFR-SEC-04 (Internal Data Isolation):** The backend must automatically strip `isInternal: true` comments when fulfilling requests initiated by users with role `EMPLOYEE`.
* **NFR-SEC-05 (Authentication Hardening):** Password reset or authentication attempts must be protected by rate limiters (e.g., maximum 5 failed attempts per 15-minute window per IP).

### 3.2 Performance & Efficiency (NFR-PERF)
* **NFR-PERF-01:** 95% of read queries (dashboard summaries, ticket listings) must resolve in less than 200ms under standard local network conditions.
* **NFR-PERF-02:** Composite and foreign key indexes must be applied to all filtering columns (`status`, `employeeId`, `assignedTechnicianId`, `categoryId`, `departmentId`).
* **NFR-PERF-03:** Ticket listing endpoints must support cursor or offset pagination (defaulting to 20 records per page) to prevent full-table memory exhaustion.

### 3.3 Reliability & Transactional Integrity (NFR-REL)
* **NFR-REL-01 (Atomicity):** Status transitions, assignment dispatches, and history logging must execute within PostgreSQL transactions (`prisma.$transaction`).
* **NFR-REL-02 (Defensive Deletion):** Foreign key constraints between `tickets` and parents (`users`, `departments`, `categories`) must enforce `ON DELETE RESTRICT` to ensure institutional records cannot be orphaned or destroyed.
* **NFR-REL-03 (Graceful Error Handling):** The backend must catch unexpected runtime exceptions and return standardized JSON error envelopes without dumping stack traces or database connection strings.

### 3.4 Maintainability & Extensibility (NFR-MAINT)
* **NFR-MAINT-01:** Monorepo architecture separating frontend (`/frontend`) and backend (`/backend`) with independent configurations, dependencies, and environment files.
* **NFR-MAINT-02:** Strict TypeScript types shared conceptually or physically to ensure contract safety between backend service interfaces and frontend presentation.
