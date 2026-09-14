# REST API Specification: CBE IT Support Ticket Management System

> **Document Status:** Complete / Architectural Baseline (Phase 1)  
> **API Standard:** RESTful JSON over HTTPS  
> **Target Framework:** Express.js 4/5 (TypeScript)  

---

## 1. Global API Standards

### 1.1 Headers
* `Content-Type: application/json`
* `Authorization: Bearer <JWT_ACCESS_TOKEN>`

### 1.2 Standard Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 105
  }
}
```

### 1.3 Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERR_FORBIDDEN_RESOURCE",
    "message": "You are not authorized to perform this operation on this ticket.",
    "details": null
  }
}
```

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Profile (`/api/auth`)

| Method | Endpoint | Authorized Roles | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials; returns JWT | `{ "email": "...", "password": "..." }` |
| `POST` | `/api/auth/logout` | Authenticated | Invalidates client session/token | None |
| `GET` | `/api/auth/me` | Authenticated | Returns currently authenticated user context | None |

---

### 2.2 Tickets Management (`/api/tickets`)

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets` | Any Authenticated | Multi-role listing: Admin gets all, Tech gets assigned, Employee gets own |
| `POST` | `/api/tickets` | `EMPLOYEE`, `ADMINISTRATOR` | Creates a new support ticket |
| `GET` | `/api/tickets/:id` | Any Authenticated | Retrieves ticket details by ID (enforcing ownership) |
| `PATCH` | `/api/tickets/:id/status` | `TECHNICIAN`, `ADMINISTRATOR` | Transitions ticket lifecycle status |
| `POST` | `/api/tickets/:id/assign` | `ADMINISTRATOR` | Assigns or reassigns technician |
| `POST` | `/api/tickets/:id/cancel` | `EMPLOYEE`, `ADMINISTRATOR` | Cancels an open ticket with mandatory reason |
| `POST` | `/api/tickets/:id/resolve`| `TECHNICIAN`, `ADMINISTRATOR` | Resolves ticket with required resolution notes |
| `POST` | `/api/tickets/:id/close` | `ADMINISTRATOR` | Formally closes a resolved ticket |

#### Ticket Creation Schema (`POST /api/tickets`)
```json
{
  "title": "Core banking terminal failing to connect to LAN",
  "description": "After rebooting workstation PC-04 in Branch 12, the terminal displays Socket Error 10054 continuously.",
  "categoryId": "48b671a5-812e-4b47-b2f7-f138865d4911",
  "priority": "HIGH"
}
```

#### Ticket Assignment Schema (`POST /api/tickets/:id/assign`)
```json
{
  "technicianId": "c4d7e9b2-32a1-4321-9988-faecb5478901",
  "assignmentNotes": "Priority ticket for immediate dispatch."
}
```

#### Ticket Resolution Schema (`POST /api/tickets/:id/resolve`)
```json
{
  "resolutionNotes": "Replaced faulty RJ45 patch cable connecting to wall jack #04 and verified gateway connectivity. Core banking terminal successfully authenticated."
}
```

---

### 2.3 Ticket Comments & Troubleshooting Notes (`/api/tickets/:id/comments`)

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets/:id/comments` | Any Authenticated | Retrieves ticket comments (internal notes filtered for Employees) |
| `POST` | `/api/tickets/:id/comments` | Any Authenticated | Appends a comment or troubleshooting note |

#### Comment Creation Schema (`POST /api/tickets/:id/comments`)
```json
{
  "content": "Workstation NIC re-seated; testing ping to gateway 10.2.1.1.",
  "isInternal": true
}
```
*Note: If an `EMPLOYEE` attempts to submit `isInternal: true`, the API rejects with HTTP 403 or forces `isInternal = false`.*

---

### 2.4 User Administration (`/api/users`)

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | `ADMINISTRATOR` | List users with filtering by role, department, status |
| `POST` | `/api/users` | `ADMINISTRATOR` | Create new employee, technician, or admin user |
| `GET` | `/api/users/:id` | `ADMINISTRATOR` | Retrieve specific user details |
| `PATCH` | `/api/users/:id` | `ADMINISTRATOR` | Update user metadata, department, or active status |
| `GET` | `/api/users/technicians/active` | `ADMINISTRATOR` | Fetch list of active technicians for assignment dropdown |

---

### 2.5 Department Management (`/api/departments`)

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Any Authenticated | Fetch active departments for registration/ticketing |
| `POST` | `/api/departments` | `ADMINISTRATOR` | Create a new organizational department |
| `PATCH` | `/api/departments/:id` | `ADMINISTRATOR` | Update department details or toggle active status |

---

### 2.6 Category Management (`/api/categories`)

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Any Authenticated | Fetch active ticket categories for dropdowns |
| `POST` | `/api/categories` | `ADMINISTRATOR` | Add a new ticket category |
| `PATCH` | `/api/categories/:id` | `ADMINISTRATOR` | Edit category name/description or toggle status |

---

### 2.7 Management Analytics & Reporting (`/api/reports`)

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/summary` | `ADMINISTRATOR` | Aggregated count cards (Total, Open, In Progress, Resolved) |
| `GET` | `/api/reports/by-category` | `ADMINISTRATOR` | Distribution breakdown of tickets per category |
| `GET` | `/api/reports/by-department`| `ADMINISTRATOR` | Incident volume grouped by requesting department |
| `GET` | `/api/reports/by-technician`| `ADMINISTRATOR` | Technician workload, resolution counts, and in-progress stats |
| `GET` | `/api/reports/performance` | `ADMINISTRATOR` | Average resolution time and SLA performance metrics |
