# Authorization Matrix & Access Control: CBE IT Support Ticket Management System

> **Document Status:** Complete / Architectural Baseline (Phase 1)  
> **Model:** Role-Based Access Control (RBAC) + Resource Ownership Verification  

---

## 1. Role Definitions

1. **`EMPLOYEE`:** Standard CBE personnel. Authenticated users who report incidents regarding their daily IT equipment, banking client software, or email access.
2. **`TECHNICIAN`:** Information Systems operational support personnel. Assigned to troubleshoot and resolve assigned technical incidents.
3. **`ADMINISTRATOR`:** Helpdesk supervisors, team leads, or IS managers with full supervisory, dispatching, and analytical privileges.

---

## 2. Permission Matrix (CRUD & Domain Operations)

| Operational Capability | Employee | Technician | Administrator | Ownership / Scoping Invariant |
| :--- | :---: | :---: | :---: | :--- |
| **User Authentication (`login`, `me`)** | ✓ | ✓ | ✓ | Any active account (`isActive == true`) |
| **View Own Submitted Tickets** | ✓ | ✓* | ✓ | `ticket.employeeId == currentUserId` |
| **View Assigned Tickets** | ✗ | ✓ | ✓ | Technician: `ticket.assignedTechnicianId == currentUserId` |
| **View All System Tickets** | ✗ | ✗ | ✓ | Unrestricted global access |
| **Create Incident Ticket** | ✓ | ✓* | ✓* | Author automatically mapped to `currentUserId` |
| **Cancel Ticket** | Limited | ✗ | ✓ | Employee: only while `status == 'OPEN'` |
| **Assign / Reassign Technician** | ✗ | ✗ | ✓ | Administrator exclusive capability |
| **Start Working (`IN_PROGRESS`)** | ✗ | ✓ | ✓ | Technician: must be assigned technician |
| **Add Public Comment** | ✓ | ✓ | ✓ | Employee: only on own ticket; Tech: on assigned ticket |
| **Add Internal Troubleshooting Note**| ✗ | ✓ | ✓ | Flagged as `isInternal = true` |
| **View Internal Notes** | ✗ | ✓ | ✓ | Stripped completely from Employee responses |
| **Resolve Ticket (`RESOLVED`)** | ✗ | ✓ | ✓ | Requires mandatory `resolutionNotes` |
| **Close Ticket (`CLOSED`)** | ✗ | ✗ | ✓ | Confirmed operational closure |
| **Manage Users (Create/Update/Status)**| ✗ | ✗ | ✓ | Administrator exclusive |
| **Manage Departments** | ✗ | ✗ | ✓ | Administrator exclusive |
| **Manage Categories** | ✗ | ✗ | ✓ | Administrator exclusive |
| **View Analytical Reports & Metrics** | ✗ | ✗ | ✓ | Administrator exclusive |

*\*Note on Technicians/Administrators submitting tickets:* While Technicians and Administrators are employees of the bank and can submit incident tickets if their own workstations fail, their elevated role privileges do not apply to their own submitted tickets unless acted upon through their official duties.

---

## 3. Two-Tier Authorization Enforcement

Authorization is enforced at two distinct architectural levels:

### Tier 1: Role-Based Route Guard (Middleware)
Checks whether the authenticated user's role exists within the authorized roles array for an endpoint.
* Example: `router.post('/api/tickets/:id/assign', authorize(['ADMINISTRATOR']), ticketController.assignTicket)`
* Example: `router.get('/api/reports/summary', authorize(['ADMINISTRATOR']), reportController.getSummary)`

### Tier 2: Resource Ownership & State Validator (Service Level)
Even if a user holds a valid role, the service layer evaluates contextual resource ownership and domain preconditions:
1. **Employee Ticket Access:**
   ```typescript
   if (currentUser.role === 'EMPLOYEE' && ticket.employeeId !== currentUser.id) {
     throw new ForbiddenException("Access denied: You are not authorized to view this ticket.");
   }
   ```
2. **Technician Action on Ticket:**
   ```typescript
   if (currentUser.role === 'TECHNICIAN' && ticket.assignedTechnicianId !== currentUser.id) {
     throw new ForbiddenException("Access denied: This ticket is not assigned to you.");
   }
   ```
3. **Internal Comment Protection:**
   ```typescript
   if (currentUser.role === 'EMPLOYEE') {
     // Strips internal notes from database results
     comments = comments.filter(c => !c.isInternal);
   }
   ```
