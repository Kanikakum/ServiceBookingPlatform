# Service Booking Platform (Monorepo)

A production-ready, high-concurrency **Service Booking Platform** engineered for seamless customer appointments, provider service management, and zero double-booking reliability.

---

## 🛠 Technology Stack

- **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS
- **Backend**: Node.js, Express.js (Clean Layered Architecture)
- **Database**: MySQL 8.0+
- **ORM**: Prisma ORM
- **Validation**: Zod
- **Authentication**: JWT & bcryptjs password hashing
- **Concurrency & Transaction Engine**: ACID Transactions with Row Locking & Serializable Isolation

---

## 🏛 Architecture & Project Layout

```
service-booking-platform/
│
├── frontend/               # Next.js App Router client application
│   ├── src/
│   │   ├── app/            # App routes & layouts
│   │   ├── components/     # UI, forms, and feature components
│   │   ├── hooks/          # Custom state & query hooks
│   │   ├── services/       # API integration client
│   │   └── utils/          # Utility formatters
│   └── package.json
│
├── backend/                # Express.js REST API server
│   ├── prisma/             # Prisma database schema, seeds & migrations
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── src/
│   │   ├── config/         # Environment variables & constants
│   │   ├── controllers/    # Thin HTTP request & response handlers
│   │   ├── middleware/     # Auth, RBAC, validation, and error handlers
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # Domain business logic & transactions
│   │   ├── repositories/   # Prisma query layer
│   │   ├── validators/     # Zod schema validation
│   │   ├── utils/          # Standard response and error helpers
│   │   ├── db/             # Prisma client singleton
│   │   ├── app.js          # Express app configuration
│   │   └── server.js       # Server bootstrap and graceful shutdown
│   ├── tests/              # Automated backend test suites
│   │   ├── auth.test.js
│   │   └── service.test.js
│   └── package.json
│
├── database/               # Database design, SQL DDL reference, and indexing strategy
│   ├── README.md
│   └── schema.sql
│
├── docs/                   # Architectural blueprints & API specifications
│   ├── ARCHITECTURE.md     # Full architectural documentation
│   ├── BOOKING-CONCURRENCY.md # Double-booking & race condition prevention blueprint
│   └── API.md              # REST API contract & endpoints documentation
│
├── .gitignore
├── .env.example
├── package.json            # Monorepo orchestration scripts
└── README.md
```

---

## 📦 Implemented Modules (Phase 1, Phase 2 & Phase 3)

1. **Authentication & RBAC Module (Phase 1)**:
   - Customer & Provider registration and login.
   - Secure bcrypt password hashing with 12 salt rounds.
   - JWT token generation & verification (`userId`, `role`).
   - Role-based authorization middleware (`requireRole('CUSTOMER')`, `requireRole('PROVIDER')`).
   - Profile retrieval endpoint (`GET /api/auth/me`).

2. **Category Management & Service Catalog Module (Phase 2)**:
   - Idempotent Prisma category seeding (`Home Cleaning`, `Plumbing`, `Electrical`, `Beauty & Wellness`, `Appliance Repair`, `Tutoring`, `Fitness`, `Car Wash`).
   - Customer category discovery endpoint (`GET /api/categories`).
   - Provider Service CRUD (`POST /api/services`, `PUT /api/services/:id`, `DELETE /api/services/:id`).
   - Provider service listing (`GET /api/services/provider/me`).
   - Strict server-side provider ownership verification (403 on tampering).
   - Soft-delete / deactivation pattern (`isActive = false`) to preserve booking historical integrity.
   - Customer Public Catalog (`GET /api/services`) with full-text search, category filter, min/max price, sort, and pagination.

3. **Booking System & Concurrency Engine (Phase 3)**:
   - Advisory availability generator (`GET /api/bookings/availability`) for dynamic daily slots.
   - ACID Transactional booking creation (`POST /api/bookings`) with pessimistic row locking (`SELECT ... FOR UPDATE` under `ReadCommitted` isolation) guaranteeing zero double-bookings.
   - Unidirectional state transition engine:
     - `PENDING` -> `CONFIRMED` (Provider accept: `PATCH /api/bookings/:id/accept`)
     - `PENDING` -> `REJECTED` (Provider reject: `PATCH /api/bookings/:id/reject`)
     - `PENDING` / `CONFIRMED` -> `CANCELLED` (Customer cancel: `PATCH /api/bookings/:id/cancel`)
   - Price snapshotting on booking creation (`totalPrice`), ensuring historical financial accuracy even if service price updates later.
   - Role-segregated booking listings:
     - Customer bookings (`GET /api/bookings/customer`)
     - Provider bookings (`GET /api/bookings/provider`)
   - 10-parallel request concurrency stress testing verifying exactly 1 booking success (201) and 9 conflict rejections (409).

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+ or v20+ / v22+)
- npm (v9+)
- MySQL (v8.0+)

### 1. Configure Environment Variables
Copy `.env.example` to `backend/.env` and `frontend/.env.local`:
```bash
cp .env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Configure your MySQL connection string in `backend/.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/service_booking_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
```

### 2. Run Migrations & Seed Categories
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 3. Run Automated Tests
```bash
# Run all backend tests (Auth + Service + Booking tests: 86/86 passing)
npm run test:backend

# Run Auth suite only (24 tests)
npm run test:auth

# Run Service suite only (34 tests)
npm run test:service

# Run Booking & Concurrency suite only (28 tests)
npm run test:booking
```

### 4. Run Development Servers
```bash
# Run Backend API (Port 5000)
npm run dev:backend

# Run Frontend Application (Port 3000)
npm run dev:frontend

# Or run both concurrently
npm run dev
```

---

## 🔍 REST API Summary

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check |
| `POST` | `/api/auth/register` | Public | Register Customer or Provider |
| `POST` | `/api/auth/login` | Public | Authenticate user, receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `GET` | `/api/categories` | Public | List all available service categories |
| `GET` | `/api/services` | Public | Public catalog search, filter, sort & paginate |
| `GET` | `/api/services/:id` | Public | Retrieve single service details |
| `POST` | `/api/services` | Provider | Create a new service |
| `GET` | `/api/services/provider/me` | Provider | List services owned by authenticated provider |
| `PUT` | `/api/services/:id` | Provider | Update owned service |
| `DELETE` | `/api/services/:id` | Provider | Deactivate/soft-delete owned service |
| `GET` | `/api/bookings/availability` | Customer / Provider | Advisory slot availability for date & service |
| `POST` | `/api/bookings` | Customer | Concurrency-safe booking creation |
| `GET` | `/api/bookings/customer` | Customer | List customer's own bookings (paginated) |
| `PATCH` | `/api/bookings/:id/cancel` | Customer | Cancel an active booking |
| `GET` | `/api/bookings/provider` | Provider | List provider's scheduled bookings (paginated) |
| `PATCH` | `/api/bookings/:id/accept` | Provider | Accept pending booking (`CONFIRMED`) |
| `PATCH` | `/api/bookings/:id/reject` | Provider | Reject pending booking (`REJECTED`) |

---

## 📖 Detailed Documentation

- [REST API Specifications](docs/API.md)
- [System Architecture Blueprint](docs/ARCHITECTURE.md)
- [Booking Concurrency & Race Condition Prevention Strategy](docs/BOOKING-CONCURRENCY.md)
- [Database Schema & Indexing Specifications](database/README.md)
