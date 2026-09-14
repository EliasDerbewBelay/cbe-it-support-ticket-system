# System Overview: CBE IT Support Ticket Management System

> **Document Status:** Complete / Architectural Baseline (Phase 1)  
> **Target Audience:** Academic Defence Committee, Senior Engineers, Technical Stakeholders  
> **Project Type:** Internship Defence Project (Prototype Specification)  
> **Context:** Information Systems (IS) Department, Commercial Bank of Ethiopia (CBE)  

---

## 1. Executive Summary

The **Commercial Bank of Ethiopia (CBE) IT Support Ticket Management System** is an enterprise-grade internal service-desk solution designed to streamline, track, and resolve IT hardware, software, network, and operational issues. Developed as an academic internship defence project inspired by real-world operational workflows in CBE's Information Systems (IS) Department, this specification establishes an auditable, role-governed, and decoupled architecture.

In large-scale banking environments, ad-hoc IT support requests (communicated via unmonitored phone calls, walk-ins, or direct emails) suffer from lack of traceability, undocumented service level agreements (SLAs), unclear ownership, and the inability to extract institutional metrics on infrastructure failures. This project proposes a centralized web platform that enforces role-based ticket lifecycles, structured technician assignment, internal vs. external communication trails, and management reporting.

---

## 2. Institutional Context & Academic Prototype Disclaimer

### 2.1 Background
The Commercial Bank of Ethiopia is the leading commercial bank in Ethiopia, operating hundreds of branches nationwide supported by a central Information Systems infrastructure. Effective IT service delivery is mission-critical for customer-facing banking applications, core banking infrastructure, ATM/POS network reliability, and back-office operations.

### 2.2 Disclaimer & Academic Scope
* **Proposed Prototype:** This software architecture is a **proposed system / academic prototype** developed strictly for an internship defence.
* **No Proprietary Disclosure:** This specification does not disclose, simulate, or reverse-engineer proprietary CBE core-banking source code, internal network topologies, Active Directory schemas, or confidential bank configurations.
* **Realistic Emulation:** Operational flows (e.g., branch employee submitting a ticket, IS helpdesk dispatching a technician, field/systems engineer resolving the issue) emulate industry-standard ITIL (Information Technology Infrastructure Library) service management principles adapted to banking IT support.

---

## 3. Core Objectives

1. **Centralized Incident Logging:** Provide a single, validated entry point for bank employees across departments to report IT disruptions with categorized metadata and priority indications.
2. **Deterministic Role Segregation:** Enforce rigid access control across three user classes:
   * **Employees (End Users):** Submit, monitor, and confirm resolution of their own incidents.
   * **Technicians (IS Support Personnel):** Manage, troubleshoot, log private diagnostic notes, and resolve tickets specifically assigned to them.
   * **Administrators (IS Helpdesk Supervisors / Managers):** Supervise organizational departments, user accounts, category catalogs, ticket triage, and technician dispatching.
3. **Immutable Lifecycle Traceability:** Maintain an unalterable chronological audit log of all ticket state transitions, technician handovers, and resolution milestones.
4. **Data Privacy & Security:** Isolate internal diagnostic and technical troubleshooting notes from end-user visibility while preserving communication transparency.
5. **Decoupled Modern Architecture:** Separate presentation from persistence via a Next.js frontend, an Express.js RESTful API gateway, and a normalized PostgreSQL database managed through Prisma ORM.

---

## 4. Key Architectural Tenets

```
+-------------------------------------------------------------------------+
|                              Next.js Frontend                           |
|       (App Router, Server/Client Components, Tailwind CSS, shadcn/ui)   |
+------------------------------------+------------------------------------+
                                     |  HTTPS / JSON / JWT Bearer
                                     v
+-------------------------------------------------------------------------+
|                            Express.js Backend                           |
|  (Auth Middleware, RBAC Guard, Zod Validators, Service Business Logic)  |
+------------------------------------+------------------------------------+
                                     |  Prisma Client Queries / Transactions
                                     v
+-------------------------------------------------------------------------+
|                        PostgreSQL Relational DB                         |
|                 (Hosted on Supabase, Strongly Typed, ACID)              |
+-------------------------------------------------------------------------+
```

* **Zero Direct Database Access from Frontend:** The Next.js client interacts exclusively with the Express.js REST API. No database credentials, connection strings, or direct Supabase client libraries exist on the frontend.
* **Normalized Relational Integrity:** Enforces relational foreign keys, unique constraints, and strict deletion policies (`RESTRICT` on referenced users and departments) to prevent accidental data destruction.
* **Explicit State Transitions:** Ticket status changes cannot be bypassed; every status update executes within a transactional state machine verifying preconditions and writing historical audit records.
