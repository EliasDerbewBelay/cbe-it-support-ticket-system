# Use Case Specification: CBE IT Support Ticket Management System

> **Document Status:** Complete / Architectural Baseline (Phase 1)  
> **Standard:** Unified Modeling Language (UML) / Use Case Narratives  

---

## 1. Conceptual Use Case Diagram

```mermaid
graph LR
    subgraph System Boundary: CBE IT Support Ticket System
        subgraph Authentication
            UC_LOGIN["UC-01: Authenticate / Login"]
            UC_LOGOUT["UC-02: Logout & Session Invalidation"]
        end

        subgraph Employee Operations
            UC_CREATE["UC-03: Create Support Ticket"]
            UC_VIEW_OWN["UC-04: View Own Tickets & Status"]
            UC_CANCEL["UC-05: Cancel Open Ticket"]
            UC_COMMENT_PUB["UC-06: Add Public Comment"]
        end

        subgraph Technician Operations
            UC_VIEW_ASSIGNED["UC-07: View Assigned Tickets"]
            UC_START_WORK["UC-08: Transition to IN_PROGRESS"]
            UC_ADD_INTERNAL["UC-09: Add Internal Troubleshooting Note"]
            UC_RESOLVE["UC-10: Resolve Ticket with Notes"]
        end

        subgraph Administrator Operations
            UC_VIEW_ALL["UC-11: View Global Ticket Queue"]
            UC_ASSIGN["UC-12: Assign / Reassign Technician"]
            UC_CLOSE["UC-13: Close Resolved Ticket"]
            UC_MANAGE_USERS["UC-14: Manage Users & Roles"]
            UC_MANAGE_DEPTS["UC-15: Manage Departments"]
            UC_MANAGE_CATS["UC-16: Manage Ticket Categories"]
            UC_REPORTS["UC-17: Generate Analytics & SLA Reports"]
        end
    end

    ACT_EMP((Employee))
    ACT_TECH((Technician))
    ACT_ADMIN((Administrator))

    ACT_EMP --> UC_LOGIN
    ACT_EMP --> UC_LOGOUT
    ACT_EMP --> UC_CREATE
    ACT_EMP --> UC_VIEW_OWN
    ACT_EMP --> UC_CANCEL
    ACT_EMP --> UC_COMMENT_PUB

    ACT_TECH --> UC_LOGIN
    ACT_TECH --> UC_LOGOUT
    ACT_TECH --> UC_VIEW_ASSIGNED
    ACT_TECH --> UC_START_WORK
    ACT_TECH --> UC_ADD_INTERNAL
    ACT_TECH --> UC_COMMENT_PUB
    ACT_TECH --> UC_RESOLVE

    ACT_ADMIN --> UC_LOGIN
    ACT_ADMIN --> UC_LOGOUT
    ACT_ADMIN --> UC_VIEW_ALL
    ACT_ADMIN --> UC_ASSIGN
    ACT_ADMIN --> UC_CLOSE
    ACT_ADMIN --> UC_MANAGE_USERS
    ACT_ADMIN --> UC_MANAGE_DEPTS
    ACT_ADMIN --> UC_MANAGE_CATS
    ACT_ADMIN --> UC_REPORTS
```

---

## 2. Detailed Use Case Narratives

### Use Case UC-03: Create Support Ticket
* **Primary Actor:** Employee
* **Preconditions:** Employee is authenticated with active account (`isActive == true`).
* **Main Success Scenario:**
  1. Employee navigates to the Ticket Submission portal.
  2. System loads available active Categories from `/api/categories`.
  3. Employee enters Title, Problem Description, Category, and perceived Priority.
  4. Employee clicks "Submit Ticket".
  5. System validates inputs against Zod schema rules.
  6. Backend automatically associates `employeeId` (from JWT session) and the employee's current `departmentId`.
  7. Backend sets `status = 'OPEN'`, creates the Ticket, and records the initial `TicketStatusHistory` entry in a database transaction.
  8. System redirects employee to the ticket detail page and displays confirmation.
* **Postconditions:** Ticket is stored in `OPEN` status and becomes visible in the Administrator unassigned dispatch queue.

---

### Use Case UC-12: Assign / Reassign Technician
* **Primary Actor:** Administrator
* **Preconditions:** Administrator is authenticated. Target ticket is in `OPEN`, `ASSIGNED`, or `IN_PROGRESS` status.
* **Main Success Scenario:**
  1. Administrator reviews the unassigned ticket queue.
  2. Administrator selects a ticket and clicks "Assign Technician".
  3. System presents a list of active technicians (`isActive == true`, `role == 'TECHNICIAN'`).
  4. Administrator selects a technician, optionally enters assignment notes, and submits.
  5. Backend verifies the target user is an active technician.
  6. In a single transaction:
     * Previous active assignment (if any) is updated with `unassignedAt = NOW()`, `isActive = false`.
     * New `TicketAssignment` is inserted with `isActive = true`.
     * Ticket record is updated with `assignedTechnicianId` and `status = 'ASSIGNED'`.
     * `TicketStatusHistory` record is appended (`previousStatus -> 'ASSIGNED'`).
  7. Administrator sees updated assignment confirmation.
* **Postconditions:** The ticket appears in the designated technician's active workspace queue.

---

### Use Case UC-10: Resolve Ticket with Notes
* **Primary Actor:** Technician
* **Preconditions:** Ticket is in `IN_PROGRESS` status and assigned to the authenticated technician.
* **Main Success Scenario:**
  1. Technician opens the assigned ticket workspace.
  2. Technician selects "Mark as Resolved".
  3. System prompts for mandatory Resolution Notes explaining root cause and resolution actions taken.
  4. Technician provides detailed resolution text (minimum 20 characters) and submits.
  5. Backend verifies that the caller is the assigned technician.
  6. In a single transaction:
     * Ticket status updated to `RESOLVED`.
     * `resolutionNotes`, `resolvedAt`, and `resolvedById` are updated.
     * `TicketStatusHistory` is appended (`IN_PROGRESS -> RESOLVED`).
  7. Technician workspace updates; notification/status update is visible to the submitting employee.
* **Postconditions:** Ticket status is `RESOLVED`, enabling the Administrator or Employee to conduct final verification.
