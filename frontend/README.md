# Commercial Bank of Ethiopia (CBE) - IT Support Ticket Management System
## Frontend Client (Next.js 16 App Router + Tailwind CSS + shadcn/ui)

A minimalist, high-density, enterprise-grade service-desk frontend designed for branch bank employees, IT support engineers, and Information Systems supervisors at the Commercial Bank of Ethiopia.

---

### 1. Minimalist Design System & Brand Identity

* **Design Tenets:** Clean typography, generous whitespace, subtle borders, high information density without visual clutter, crisp state badges, and smooth state transitions.
* **Palette:** Official Commercial Bank of Ethiopia purple (`#6f1a7e`, `#561361`) with subtle gold accents (`#edb72b`), paired with neutral zinc slate backgrounds.
* **Component Primitives:** Built with shadcn/ui (Base UI + Tailwind CSS v4) including `Dialog`, `Table`, `Select`, `Card`, `Badge`, `Tabs`, `Textarea`, `Input`, and `Sonner` toast notifications.

---

### 2. Professional Directory Architecture

```
frontend/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Public Authentication Group
│   │   │   ├── layout.tsx           # Centered minimalist auth shell
│   │   │   └── login/page.tsx       # Staff sign-in + quick demo switchers
│   │   ├── (dashboard)/             # Protected Workspace Group
│   │   │   ├── layout.tsx           # Dashboard shell: Sidebar, Header, Role Guards
│   │   │   ├── tickets/             # Ticket incident management
│   │   │   │   ├── page.tsx         # Ticket list with filters, search, table/card toggle
│   │   │   │   ├── new/page.tsx     # Incident logging with branch templates
│   │   │   │   └── [id]/page.tsx    # Incident record, diagnostic notes, audit timeline
│   │   │   ├── technician/          # Support Engineer Workstation
│   │   │   │   └── queue/page.tsx   # Assigned incidents queue & quick triage
│   │   │   └── admin/               # Helpdesk Supervisory Suite
│   │   │       ├── reports/page.tsx # Executive dashboard, KPIs, SLA performance
│   │   │       ├── users/page.tsx   # Staff accounts, roles & deactivations
│   │   │       ├── departments/page.tsx # CBE organizational units & branches
│   │   │       ├── categories/page.tsx  # Incident taxonomy & scope catalogs
│   │   │       └── audit-logs/page.tsx  # Immutable chronological state transitions
│   │   ├── globals.css              # Tailwind CSS v4 + theme variables
│   │   └── layout.tsx               # Root layout with AuthProvider & Toaster
│   ├── components/
│   │   ├── ui/                      # shadcn UI atomic components
│   │   ├── layout/                  # Shell components (Sidebar, Header)
│   │   ├── shared/                  # Reusable domain components (StatusBadge, PriorityBadge, RoleBadge, EmptyState, PageHeader)
│   │   └── tickets/                 # Ticket domain components (TicketCard, TicketTable, TicketFilters, AssignModal, ResolveModal, CancelModal, Timeline, CommentsSection)
│   ├── context/
│   │   └── auth-context.tsx         # JWT token hydration, login/logout, role state
│   ├── hooks/
│   │   └── use-auth.ts              # Consumer hook for auth context
│   ├── lib/
│   │   ├── api/                     # Type-safe API abstraction layer
│   │   │   ├── client.ts            # Fetch client with interceptors & JWT injection
│   │   │   ├── auth.ts              # Authentication endpoints
│   │   │   ├── tickets.ts           # Tickets & comments lifecycle endpoints
│   │   │   └── admin.ts             # Users, departments, categories, reports, audit
│   │   ├── constants.ts             # Status/Priority badge variants & color mappings
│   │   └── utils.ts                 # Date formatters, relative time & class merging
│   └── types/                       # Strongly typed models mirroring database & API
│       ├── auth.ts
│       ├── ticket.ts
│       └── admin.ts
```

---

### 3. Quick Demo Authentication Accounts

For defence evaluations and live testing, the login screen includes 1-click credential auto-fill for all three system roles:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin.is@cbe.com.et` | `Password@123` | Full administrative control, user/department management, technician assignment, analytics & audit log |
| **Technician** | `tech.support@cbe.com.et` | `Password@123` | Assigned incident queue, internal diagnostic notes, "Start Work", "Mark as Resolved" |
| **Employee** | `chaltu.finance@cbe.com.et` | `Password@123` | Incident logging, tracking personal tickets, external discussion trail, ticket cancellation |

---

### 4. Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Run Next.js development server
npm run dev

# 3. Production build & validation
npm run lint
npm run build
```
