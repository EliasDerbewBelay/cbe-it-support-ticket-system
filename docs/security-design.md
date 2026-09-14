# Security Architecture: CBE IT Support Ticket Management System

> **Document Status:** Complete / Architectural Baseline (Phase 1)  
> **Target Environment:** Academic Internship Prototype with Enterprise Best Practices  

---

## 1. Prototype Scope vs. Real-World Banking Enterprise

To maintain academic defensibility during the internship defence, the following distinction is explicitly documented:

| Dimension | Proposed Academic Prototype (This Project) | Real-World Enterprise Banking Deployment |
| :--- | :--- | :--- |
| **Authentication Authority** | Local database authentication with salted bcrypt hashes and JWT tokens. | Enterprise Active Directory / LDAP / Kerberos / SAML 2.0 / Okta SSO with Hardware MFA (RSA tokens/FIDO2). |
| **Network Placement** | Cloud-hosted Supabase PostgreSQL + Node.js runtime over standard HTTPS. | Demilitarized Zone (DMZ), Air-gapped internal bank Intranet, isolated VLANs, Hardware Security Modules (HSM). |
| **Privilege Access** | Application-level Role-Based Access Control (RBAC). | PAM (Privileged Access Management) with session recording, dual-custody authorization. |
| **Data At Rest** | PostgreSQL AES-256 transparent database encryption via Supabase. | Enterprise Database TDE, dedicated hardware key management (KMIP/HSM). |
| **Audit Compliance** | Application-level audit tables (`TicketStatusHistory`, `TicketAssignment`). | SIEM (Splunk, IBM QRadar) ingestion, immutable write-once-read-many (WORM) storage. |

---

## 2. Core Security Controls Implemented in the Prototype

### 2.1 Password Security & Cryptography
* Passwords hashed using **bcrypt** with a minimum salt work factor of **12** (or **argon2id**).
* Plaintext passwords are never logged, never stored in cache, and excluded from ORM query selections (`select: { passwordHash: false }`).
* Minimum password complexity enforced at API boundary: 8+ characters, including at least one uppercase letter, one number, and one special character.

### 2.2 JWT Authentication & Session Token Lifecycle
* **Token Structure:** Stateless JSON Web Token containing `{ "sub": user.id, "role": user.role, "email": user.email }`.
* **Signing Algorithm:** HMAC-SHA256 (`HS256`) using a cryptographically secure 256-bit secret stored in backend environment variables (`JWT_SECRET`).
* **Expiration Policy:** Short-lived access tokens (15–60 minutes) to minimize the replay window if a token is intercepted.

### 2.3 Protection Against Injection Attacks (SQLi & XSS)
* **SQL Injection:** 100% mitigated through Prisma ORM’s parameterized query compilation. Dynamic SQL string concatenation is strictly banned.
* **Cross-Site Scripting (XSS):**
  * Frontend renders all user text (titles, descriptions, comments) through React’s automatic escaping virtual DOM.
  * Backend sanitizes input strings to strip malicious scripts.
  * Express applies HTTP security headers via **Helmet** (enforcing `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and Content Security Policy).

### 2.4 CORS & Transport Layer Security
* Express configures `cors()` to accept requests **strictly** from the designated Next.js frontend origin (e.g. `http://localhost:3000` in development, or the production frontend domain).
* All client-to-server and server-to-database communication requires TLS 1.2/1.3.

### 2.5 Denial of Service & Rate Limiting
* Endpoint `/api/auth/login` is governed by `express-rate-limit` allowing a maximum of **5 failed login attempts per IP per 15 minutes** to prevent brute-force credential stuffing.
* Global rate limiter on general `/api/*` endpoints capped at 100 requests per minute per client IP.

### 2.6 Data Privacy & Segregation
* **Internal Diagnostic Leak Prevention:** The backend service layer enforces a filter removing all comments marked `isInternal: true` whenever the requester’s role is `EMPLOYEE`.
* **Role Boundary Enforcement:** Employees cannot query ticket records where `ticket.employeeId != req.user.id`. Technicians cannot update tickets where `ticket.assignedTechnicianId != req.user.id`.
