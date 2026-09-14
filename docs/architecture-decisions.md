# Architectural Decision Records (ADRs)

> **Document Status:** Complete / Architectural Baseline (Phase 1)  
> **Project:** CBE IT Support Ticket Management System  
> **Methodology:** Standard Architecture Decision Record (ADR) Format  

---

## ADR-01: Adoption of Next.js for Frontend Presentation

### Status
Accepted

### Context
The application requires a modern, responsive, and robust web user interface serving three distinct user archetypes (Employees, Technicians, Administrators). The solution must integrate cleanly with the `shadcn/ui` accessible design system and Tailwind CSS.

### Decision
Adopt **Next.js** (App Router architecture) for the frontend tier.

### Consequences & Tradeoffs
* **Benefits:**
  * Component-based architecture with rich React ecosystem.
  * Native integration with `shadcn/ui` and Radix UI primitives.
  * Server Components optimize initial page load speeds.
* **Tradeoffs:**
  * Requires strict boundary enforcement to prevent developers from accidentally running server-side database queries directly inside Next.js Server Components.
  * All database calls must be routed via HTTP to the Express backend API.

---

## ADR-02: Adoption of Express.js for Backend REST API

### Status
Accepted

### Context
While Next.js supports API Routes, mixing backend business logic and database access directly into the frontend repository blurs security perimeters, complicates independent scaling, and reduces defensibility for an enterprise-inspired system.

### Decision
Implement the backend application logic as a dedicated **Express.js** RESTful micro-service using Node.js and TypeScript.

### Consequences & Tradeoffs
* **Benefits:**
  * Clean, textbook separation of concerns (Presentation vs. Business Logic vs. Data Tier).
  * Explicit middleware pipelines for CORS, Helmet security headers, rate limiting, and JWT authentication.
  * Easy to test, mock, and demonstrate during an internship defence.
* **Tradeoffs:**
  * Requires managing two runtime processes (frontend dev server on port 3000, backend API server on port 5000).

---

## ADR-03: Selection of PostgreSQL as the Relational Database Engine

### Status
Accepted

### Context
IT support ticketing systems are inherently relational: tickets belong to departments and employees, are handled by technicians, follow rigid lifecycle state transitions, and require append-only historical audit logs. Data consistency and referential integrity are paramount.

### Decision
Use **PostgreSQL** (version 15+) as the primary relational database.

### Consequences & Tradeoffs
* **Benefits:**
  * Full ACID compliance guarantees that state transitions and audit logging succeed or fail together.
  * Native support for Enums, UUIDs, and foreign key referential integrity (`ON DELETE RESTRICT`).
  * Superior analytical aggregation performance for management reporting.
* **Tradeoffs:**
  * Requires schema migrations for schema modifications compared to schema-less NoSQL alternatives.

---

## ADR-04: Utilization of Supabase for PostgreSQL Hosting

### Status
Accepted

### Context
The academic prototype requires a reliable, managed, cloud-hosted PostgreSQL instance without incurring heavy infrastructure management overhead.

### Decision
Utilize **Supabase** solely as a managed PostgreSQL hosting provider.

### Consequences & Tradeoffs
* **Benefits:**
  * Instant provisioning of a production-grade PostgreSQL instance with SSL encryption.
  * Accessible connection strings for Prisma ORM.
  * Automatic backups and built-in database administration dashboard for demonstration.
* **Important Guardrail:** The system will connect to Supabase via standard PostgreSQL connection URLs (`DATABASE_URL`). It will **not** use proprietary Supabase client-side JavaScript SDKs or Supabase Auth in the frontend, preserving architectural portability and avoiding vendor lock-in.

---

## ADR-05: Adoption of Prisma ORM for Data Access

### Status
Accepted

### Context
Developers need type safety, automated migration management, and protection against common SQL vulnerabilities without writing brittle raw SQL strings.

### Decision
Adopt **Prisma ORM** as the exclusive data access layer within the Express.js backend.

### Consequences & Tradeoffs
* **Benefits:**
  * Auto-generated TypeScript client ensures compile-time type safety across database queries.
  * 100% parameterized query generation guarantees immunity from SQL injection.
  * Declarative schema and intuitive migration tooling (`prisma migrate`).
  * Elegant transactional API (`prisma.$transaction`) for atomic state machine updates.
* **Tradeoffs:**
  * Complex analytical grouping queries might occasionally require raw queries if Prisma’s group-by features are insufficient (not an issue for this schema).

---

## ADR-06: Strict Decoupling of Frontend and Backend

### Status
Accepted

### Context
A recurring architectural flaw in junior web projects is direct client-to-database communication or monolithic mixing of database logic into UI components.

### Decision
Enforce a strictly decoupled architecture where the Next.js frontend interacts with the database **exclusively** via the Express.js REST API.

### Consequences & Tradeoffs
* **Benefits:**
  * High defensibility in front of technical examiners.
  * Enforces the Principle of Least Privilege: frontend clients only hold bearer tokens, never database connection strings.
  * Enables future mobile or desktop client integration without altering database code.

---

## ADR-07: Dual-Tier Role-Based Access Control (RBAC) + Resource Ownership

### Status
Accepted

### Context
A generic role check (e.g. "is user a TECHNICIAN?") is insufficient because a technician must only be able to view and modify tickets assigned to them, not tickets belonging to peers. Similarly, employees must only access their own tickets.

### Decision
Implement a **Two-Tier Authorization Model**:
1. Route-level RBAC middleware verifying broad role privileges (`EMPLOYEE`, `TECHNICIAN`, `ADMINISTRATOR`).
2. Service-level ownership and domain logic checking contextual relationships (`ticket.employeeId === req.user.id` or `ticket.assignedTechnicianId === req.user.id`).

---

## ADR-08: Append-Only Ticket Status History Entity

### Status
Accepted

### Context
Financial institutions demand complete auditability. If a ticket transitions from `OPEN` to `ASSIGNED` to `IN_PROGRESS` to `RESOLVED`, the system must record who initiated each transition, when it occurred, and why.

### Decision
Introduce a dedicated `TicketStatusHistory` entity that is strictly append-only. Every status update must atomically write to this table within the same transaction.

---

## ADR-09: Dedicated TicketAssignment Entity vs. Single Foreign Key

### Status
Accepted

### Context
Tickets are frequently reassigned in IT departments (e.g. initial technician is out sick, issue requires secondary hardware escalation). A simple `assignedTechnicianId` on the `Ticket` table overwrites prior assignments, obliterating the history of who previously worked on the ticket.

### Decision
Implement a hybrid approach:
1. Maintain `assignedTechnicianId` on the `Ticket` table as an indexed pointer for rapid query resolution and filtering.
2. Introduce a dedicated `TicketAssignment` entity to permanently record every assignment event, including `assignedById`, `technicianId`, `assignedAt`, `unassignedAt`, and `assignmentNotes`.
