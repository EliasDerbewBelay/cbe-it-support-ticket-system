# Backend Architecture & Prisma Integration

> **Phase:** Phase 2 — Backend Foundation & Prisma Integration  
> **Status:** Complete & Verified  
> **Target Database:** `cbe-it-support-system-db` (Local PostgreSQL)  
> **Target Runtime:** Node.js (v22+) with TypeScript  
> **Framework:** Express.js 5  
> **ORM:** Prisma ORM 6.19.x  

---

## 1. Backend Overview

The backend service for the **CBE IT Support Ticket Management System** provides a decoupled, secure, and type-safe RESTful API tier. It acts as the sole intermediary between the Next.js frontend client and the local PostgreSQL database instance (`cbe-it-support-system-db`).

Direct database access from the client is prohibited. All domain rules, state machine transitions, and role-based permissions are enforced through Express routes and middleware before querying the database via the centralized Prisma Client.

---

## 2. Technology Stack

* **Runtime:** Node.js (v22+)
* **Language:** TypeScript
* **Web Framework:** Express.js (v5)
* **ORM:** Prisma ORM (v6.19.3)
* **Database Engine:** PostgreSQL (v14+) running locally
* **Cross-Origin Handling:** CORS middleware configured with environment-based origin controls
* **Process Execution:** `tsx` for high-speed TypeScript execution during development, `tsc` for production builds

---

## 3. Directory Structure

```text
backend/
├── prisma/
│   └── schema.prisma          # Introspected Prisma schema mapped to PostgreSQL
├── src/
│   ├── config/
│   │   └── database.ts        # Centralized PrismaClient instance & disconnection hook
│   ├── controllers/
│   │   └── healthController.ts # Handlers for API and database health checks
│   ├── middleware/
│   │   ├── errorHandler.ts    # Centralized application error handler
│   │   └── notFoundHandler.ts # Fallback 404 handler for unknown routes
│   ├── routes/
│   │   ├── healthRoutes.ts    # Route definitions for /health endpoints
│   │   └── index.ts           # Master API router mounting under /api
│   ├── services/              # Reserved for business logic modules (Phases 3-8)
│   ├── utils/                 # Shared helper functions
│   ├── app.ts                 # Express application configuration (middleware, routes)
│   └── server.ts              # HTTP server listener and graceful shutdown lifecycle
├── .env                       # Local environment variables (gitignored)
├── .env.example               # Sanitized template for environment configuration
├── .gitignore                 # Exclusion rules for environment files and dependencies
├── package.json               # Backend dependencies and package scripts
└── tsconfig.json              # TypeScript compiler configuration
```

---

## 4. Prisma Integration Architecture

The backend utilizes Prisma ORM in an **Introspection-First** workflow. Because the PostgreSQL schema was created natively via pgAdmin 4:

```text
       Local PostgreSQL Server
        (cbe-it-support-system-db)
                    │
                    │ 1. Introspect via `npx prisma db pull`
                    v
       backend/prisma/schema.prisma
                    │
                    │ 2. Compile via `npx prisma generate`
                    v
          Prisma Client Type Definitions
                    │
                    │ 3. Imported in Express
                    v
   Express.js API Layer (src/config/database.ts)
                    │
                    │ 4. Type-safe Parameterized Queries
                    v
               PostgreSQL
```

### Key Architectural Guidelines
1. **Single Reusable Client:** The application imports `prisma` exclusively from `src/config/database.ts`. Instantiating multiple `PrismaClient` instances is prohibited to avoid connection pool exhaustion.
2. **Preservation of Relations:** Multiple foreign key relationships between `users` and `tickets` (`employee`, `resolved_by_user`, `closed_by_user`) and `ticket_assignments` (`technician`, `assigned_by_user`) are explicitly named for unambiguous querying in application services.
3. **Database Non-Destruction:** All schema synchronization is strictly non-destructive. Commands like `prisma migrate reset` are banned.

---

## 5. Environment Configuration

Configuration values are parsed from `backend/.env` using `dotenv`. A sanitized template is provided in `backend/.env.example`.

| Variable | Description | Example (Development) |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string pointing to local instance | `postgresql://user:pass@localhost:5432/cbe-it-support-system-db` |
| `PORT` | Port for the Express HTTP server | `5000` |
| `NODE_ENV` | Runtime environment mode | `development` or `production` |
| `CLIENT_URL` | Allowed origin for frontend CORS requests | `http://localhost:3000` |

> [!CAUTION]
> Under no circumstances should real database passwords or credentials be committed to version control. `backend/.env` is strictly excluded in `.gitignore`.

---

## 6. Database Connection Verification

The backend is connected to the local PostgreSQL database:
* **Database Name:** `cbe-it-support-system-db`
* **Port:** `5432`
* **Verification:** The `/api/health/database` endpoint issues a lightweight `SELECT 1` query to confirm active socket connectivity and authentication.

---

## 7. Safe Development Commands

All commands should be executed from the `backend/` directory:

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Express development server with live reload via `tsx watch`. |
| `npm run build` | Compiles TypeScript source files to JavaScript in the `dist/` directory. |
| `npm start` | Runs the compiled production build from `dist/server.js`. |
| `npm run prisma:pull` | Safely introspects the current PostgreSQL database and updates `schema.prisma`. |
| `npm run prisma:generate` | Generates the strongly typed Prisma Client into `node_modules/@prisma/client`. |

> [!IMPORTANT]
> **Never execute `npx prisma migrate reset`**. The existing database tables and records are maintained as the primary source of truth.
