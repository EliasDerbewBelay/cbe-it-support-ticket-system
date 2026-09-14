# Business Rules Specification: CBE IT Support Ticket Management System

> **Document Status:** Complete / Architectural Baseline (Phase 1)  
> **Classification:** Domain Governance & Integrity Invariants  

---

## 1. Domain Governance Rules

### Rule 1: Ticket Submitter Ownership
* **Statement:** Every ticket must strictly originate from an authenticated user whose account status is `isActive = true`.
* **Invariant:** A ticket's `employeeId` is immutable once created. It cannot be transferred or reassigned to a different creator.

### Rule 2: Mandatory Domain Attributes
* **Statement:** A ticket cannot be persisted without:
  1. Non-empty, sanitized `title` (10 - 150 characters).
  2. Non-empty, sanitized `description` (>= 20 characters).
  3. Valid foreign key reference to an active `Category`.
  4. Valid `departmentId` matching the submitter's current department (snapshotted at submission).
  5. Initial status automatically set to `OPEN`.

### Rule 3: Initial Priority Setting vs. Triage Adjustment
* **Statement:** An employee may suggest an initial priority level (`LOW`, `MEDIUM`, `HIGH`).
* **Governance:** The `CRITICAL` priority level is reserved for severe operational disruptions. If an employee flags an issue as critical, or if an Administrator triages it, only an **Administrator** or **Assigned Technician** has the authority to officially designate or re-evaluate the ticket priority.

### Rule 4: Technician Assignment Exclusivity
* **Statement:** Employees cannot choose or assign technicians.
* **Governance:** Only users with the role `ADMINISTRATOR` can assign or reassign a technician. The target technician must have role `TECHNICIAN` and account status `isActive = true`.

### Rule 5: Technician Operational Scope
* **Statement:** A technician can view, start work on, add comments to, and resolve **only** tickets that are actively assigned to their user ID.
* **Exception:** A technician cannot modify tickets assigned to peers, nor can they assign tickets to themselves without administrative elevation.

### Rule 6: Mandatory Resolution Information
* **Statement:** A ticket cannot transition to the `RESOLVED` state without explicit, non-empty `resolutionNotes` (minimum 20 characters) submitted by the resolving technician or administrator.
* **Audit:** The system must record `resolvedAt` timestamp and `resolvedById` foreign key.

### Rule 7: Strict Status Transition Atomicity
* **Statement:** No direct or arbitrary status overwrites are permitted. Every state transition must follow the formal finite state machine (FSM).
* **Audit Requirement:** Every status transition must atomically create a corresponding `TicketStatusHistory` entry capturing the previous state, new state, user ID, timestamp, and transition remarks.

### Rule 8: Closed State Immutability
* **Statement:** Once a ticket transitions to `CLOSED`, it represents a legally completed service record.
* **Invariant:** A `CLOSED` ticket cannot be edited, re-opened, or transitioned back to any prior state. If an employee continues to experience similar problems, a new ticket must be submitted with a reference to the previous ticket ID.

### Rule 9: Safe Cancellation Governance
* **Statement:** A ticket can only be transitioned to `CANCELLED` under specific conditions:
  * By the **Employee (Owner)**: Only while the ticket remains in `OPEN` status (before assignment or technician work has commenced).
  * By an **Administrator**: At `OPEN` or `ASSIGNED` status if deemed duplicate, erroneous, or out of scope. A mandatory cancellation reason must be provided.

### Rule 10: Deletion vs. Deactivation (Soft Deletion)
* **Statement:** Physical (hard) deletion of users, departments, categories, and tickets is strictly prohibited.
* **Mechanism:**
  * Entities implement an `isActive` boolean flag or status field.
  * Attempting to delete a record with existing relational references will be blocked at the database level (`ON DELETE RESTRICT`).
  * Deactivating a technician does NOT delete their historical assignments or resolved tickets.

### Rule 11: Note & Comment Privacy Segregation
* **Statement:** Comments flagged as `isInternal = true` contain internal technical diagnostics, configuration notes, or escalation logs.
* **Enforcement:** Under no circumstances shall `isInternal = true` records be serialized in API responses delivered to `EMPLOYEE` users.

### Rule 12: Role Immutability for Self-Action
* **Statement:** A user cannot modify their own `role` or `isActive` status under any circumstances.
* **Enforcement:** Role modifications must be performed by a separate active administrator account.

---

## 2. Business Invariant Summary Table

| Invariant ID | Entity | Constraint / Check | Error Code on Violation |
| :--- | :--- | :--- | :--- |
| `INV-01` | `Ticket` | `employeeId` must exist and match an active user | `ERR_INVALID_SUBMITTER` |
| `INV-02` | `Ticket` | Initial status on insert must be `OPEN` | `ERR_INVALID_INITIAL_STATE` |
| `INV-03` | `TicketAssignment` | Target `technicianId` must have role `TECHNICIAN` and `isActive = true` | `ERR_INELIGIBLE_TECHNICIAN` |
| `INV-04` | `Ticket` | Status `RESOLVED` requires non-empty `resolutionNotes` | `ERR_MISSING_RESOLUTION` |
| `INV-05` | `TicketStatusHistory` | Insert must accompany every `ticket.status` change | `ERR_HISTORY_WRITE_FAILED` |
| `INV-06` | `TicketComment` | Authorship must match authenticated session | `ERR_COMMENT_AUTHOR_MISMATCH` |
| `INV-07` | `Department` | Deactivation blocked if active tickets exist in progress | `ERR_ACTIVE_TICKETS_REMAIN` |
