# Database Design: CBE IT Support Ticket Management System

> **Document Status:** Complete / Architectural Baseline (Phase 1)  
> **Database Engine:** PostgreSQL 15+ (Hosted on Supabase)  
> **ORM Target:** Prisma ORM  
> **Normalization:** 3NF (Third Normal Form)  

---

## 1. Domain Enums

### 1.1 `Role`
Represents the three fundamental security classifications within the application.
```sql
CREATE TYPE "Role" AS ENUM (
  'EMPLOYEE',
  'TECHNICIAN',
  'ADMINISTRATOR'
);
```

### 1.2 `TicketStatus`
Defines the strictly controlled lifecycle states of an IT support incident.
```sql
CREATE TYPE "TicketStatus" AS ENUM (
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'CANCELLED'
);
```

### 1.3 `TicketPriority`
Establishes the severity and urgency classification for triage and resolution prioritization.
```sql
CREATE TYPE "TicketPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);
```

---

## 2. Relational Entity Specifications

### 2.1 Entity: `Department`
* **Purpose:** Represents organizational branches, business directorates, or IT divisions within CBE.
* **Table Name:** `departments`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique department surrogate identifier |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Full title (e.g., "Core Banking Support") |
| `code` | `VARCHAR(20)` | `NOT NULL`, `UNIQUE` | Organizational code (e.g., "CBS-01") |
| `description`| `TEXT` | `NULLABLE` | Brief summary of department mandate |
| `isActive` | `BOOLEAN` | `NOT NULL`, Default `true` | Soft-deactivation status flag |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Timestamp of creation |
| `updatedAt` | `TIMESTAMPTZ` | `NOT NULL`, Auto-update | Timestamp of latest modification |

* **Indexes:**
  * `CREATE UNIQUE INDEX idx_departments_code ON departments(code);`
  * `CREATE INDEX idx_departments_is_active ON departments(isActive);`

---

### 2.2 Entity: `User`
* **Purpose:** Single consolidated user entity storing authentication credentials, profile data, and organizational hierarchy.
* **Table Name:** `users`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique user surrogate identifier |
| `staffId` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | CBE institutional employee badge/ID number |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Official enterprise email address |
| `passwordHash`| `VARCHAR(255)` | `NOT NULL` | One-way cryptographic hash (bcrypt/argon2) |
| `fullName` | `VARCHAR(150)` | `NOT NULL` | Employee's full legal name |
| `phone` | `VARCHAR(30)` | `NULLABLE` | Contact phone or extension |
| `role` | `Role` (Enum) | `NOT NULL`, Default `'EMPLOYEE'` | Access role: EMPLOYEE, TECHNICIAN, ADMINISTRATOR |
| `departmentId`| `UUID` | `NOT NULL`, `FK -> departments(id)` | User's organizational department |
| `isActive` | `BOOLEAN` | `NOT NULL`, Default `true` | Account active flag (soft-disable) |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | `NOT NULL`, Auto-update | Modification timestamp |

* **Foreign Key Constraints:**
  * `FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE`
* **Indexes:**
  * `CREATE UNIQUE INDEX idx_users_email ON users(email);`
  * `CREATE UNIQUE INDEX idx_users_staff_id ON users(staffId);`
  * `CREATE INDEX idx_users_role ON users(role);`
  * `CREATE INDEX idx_users_department_id ON users(departmentId);`

---

### 2.3 Entity: `Category`
* **Purpose:** Dynamic, database-managed classification of IT issues manageable by Administrators without code redeployment.
* **Table Name:** `categories`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique category surrogate identifier |
| `name` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Name (e.g., HARDWARE, NETWORK, PRINTER) |
| `description`| `TEXT` | `NULLABLE` | Guidance on what problems fit this category |
| `isActive` | `BOOLEAN` | `NOT NULL`, Default `true` | Soft-disable flag |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | `NOT NULL`, Auto-update | Modification timestamp |

* **Indexes:**
  * `CREATE UNIQUE INDEX idx_categories_name ON categories(name);`

---

### 2.4 Entity: `Ticket`
* **Purpose:** Core incident record tracking life of an IT support request.
* **Table Name:** `tickets`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique ticket surrogate identifier |
| `ticketNumber`| `INT` | `NOT NULL`, `UNIQUE`, Auto-increment | Human-friendly sequential ticket ID (e.g. #1024) |
| `title` | `VARCHAR(150)` | `NOT NULL` | Concise summary of the IT issue |
| `description` | `TEXT` | `NOT NULL` | Detailed technical problem description |
| `status` | `TicketStatus` | `NOT NULL`, Default `'OPEN'` | Current lifecycle state |
| `priority` | `TicketPriority`| `NOT NULL`, Default `'MEDIUM'` | Severity / priority level |
| `categoryId` | `UUID` | `NOT NULL`, `FK -> categories(id)` | Classification of the problem |
| `departmentId`| `UUID` | `NOT NULL`, `FK -> departments(id)`| Originating department at submission |
| `employeeId` | `UUID` | `NOT NULL`, `FK -> users(id)` | Author / Submitting employee |
| `assignedTechnicianId`| `UUID` | `NULLABLE`, `FK -> users(id)` | Currently assigned technician |
| `resolutionNotes` | `TEXT` | `NULLABLE` | Mandatory explanation upon resolution |
| `resolvedAt` | `TIMESTAMPTZ` | `NULLABLE` | Timestamp when ticket was marked RESOLVED |
| `resolvedById`| `UUID` | `NULLABLE`, `FK -> users(id)` | Technician/Admin who resolved the ticket |
| `closedAt` | `TIMESTAMPTZ` | `NULLABLE` | Timestamp when ticket was marked CLOSED |
| `closedById` | `UUID` | `NULLABLE`, `FK -> users(id)` | Admin/User who closed the ticket |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | `NOT NULL`, Auto-update | Modification timestamp |

* **Foreign Key Constraints:**
  * `FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE`
  * `FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE`
  * `FOREIGN KEY (employeeId) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE`
  * `FOREIGN KEY (assignedTechnicianId) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE`
  * `FOREIGN KEY (resolvedById) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE`
  * `FOREIGN KEY (closedById) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE`
* **Indexes:**
  * `CREATE UNIQUE INDEX idx_tickets_ticket_number ON tickets(ticketNumber);`
  * `CREATE INDEX idx_tickets_status ON tickets(status);`
  * `CREATE INDEX idx_tickets_priority ON tickets(priority);`
  * `CREATE INDEX idx_tickets_employee_id ON tickets(employeeId);`
  * `CREATE INDEX idx_tickets_assigned_tech ON tickets(assignedTechnicianId);`
  * `CREATE INDEX idx_tickets_category_id ON tickets(categoryId);`
  * `CREATE INDEX idx_tickets_department_id ON tickets(departmentId);`
  * `CREATE INDEX idx_tickets_created_at ON tickets(createdAt DESC);`

---

### 2.5 Entity: `TicketAssignment`
* **Purpose:** Dedicated audit entity recording technician assignment events, reassignments, and administrative delegation notes.
* **Table Name:** `ticket_assignments`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique assignment record ID |
| `ticketId` | `UUID` | `NOT NULL`, `FK -> tickets(id)` | Associated ticket |
| `technicianId`| `UUID` | `NOT NULL`, `FK -> users(id)` | Assigned technician |
| `assignedById`| `UUID` | `NOT NULL`, `FK -> users(id)` | Administrator who executed assignment |
| `assignmentNotes`| `TEXT`| `NULLABLE` | Special instructions or handover notes |
| `assignedAt` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Timestamp when assigned |
| `unassignedAt`| `TIMESTAMPTZ` | `NULLABLE` | Timestamp if reassigned to another tech |
| `isActive` | `BOOLEAN` | `NOT NULL`, Default `true` | True if this is the active assignment |

* **Foreign Key Constraints:**
  * `FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE`
  * `FOREIGN KEY (technicianId) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE`
  * `FOREIGN KEY (assignedById) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE`
* **Indexes:**
  * `CREATE INDEX idx_assignments_ticket_id ON ticket_assignments(ticketId);`
  * `CREATE INDEX idx_assignments_technician_id ON ticket_assignments(technicianId);`
  * `CREATE INDEX idx_assignments_is_active ON ticket_assignments(ticketId, isActive);`

---

### 2.6 Entity: `TicketComment`
* **Purpose:** Communicative entries and internal troubleshooting notes tied to a ticket.
* **Table Name:** `ticket_comments`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique comment identifier |
| `ticketId` | `UUID` | `NOT NULL`, `FK -> tickets(id)` | Associated ticket |
| `authorId` | `UUID` | `NOT NULL`, `FK -> users(id)` | Comment creator |
| `content` | `TEXT` | `NOT NULL` | Message or troubleshooting observation |
| `isInternal` | `BOOLEAN` | `NOT NULL`, Default `false` | If true: hidden from Employees |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | `NOT NULL`, Auto-update | Modification timestamp |

* **Foreign Key Constraints:**
  * `FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE`
  * `FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE`
* **Indexes:**
  * `CREATE INDEX idx_comments_ticket_internal ON ticket_comments(ticketId, isInternal);`
  * `CREATE INDEX idx_comments_author ON ticket_comments(authorId);`

---

### 2.7 Entity: `TicketStatusHistory`
* **Purpose:** Strictly append-only audit trail capturing every lifecycle state change.
* **Table Name:** `ticket_status_history`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Unique history log identifier |
| `ticketId` | `UUID` | `NOT NULL`, `FK -> tickets(id)` | Associated ticket |
| `changedById` | `UUID` | `NOT NULL`, `FK -> users(id)` | User who executed state change |
| `previousStatus`| `TicketStatus`| `NULLABLE` | Nullable only on ticket creation (initial state) |
| `newStatus` | `TicketStatus`| `NOT NULL` | Target status resulting from transition |
| `reason` | `TEXT` | `NULLABLE` | Explanation or mandatory reason |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL`, Default `NOW()` | Exact moment of transition |

* **Foreign Key Constraints:**
  * `FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE`
  * `FOREIGN KEY (changedById) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE`
* **Indexes:**
  * `CREATE INDEX idx_history_ticket_created ON ticket_status_history(ticketId, createdAt ASC);`
  * `CREATE INDEX idx_history_changed_by ON ticket_status_history(changedById);`

---

## 3. Relational Deletion & Integrity Strategy

* **Parent-Child Cascade:** If a ticket record is deleted, its dependent children (`TicketAssignment`, `TicketComment`, `TicketStatusHistory`) will cascade delete (`ON DELETE CASCADE`). However, tickets themselves are never deleted in standard operations.
* **Defensive Deletion (`RESTRICT`):** Attempting to delete a `User`, `Department`, or `Category` referenced by any ticket or history record will be rejected by the database engine (`ON DELETE RESTRICT`). Soft deactivation (`isActive = false`) must be used instead.
