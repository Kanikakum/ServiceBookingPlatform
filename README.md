# Service Booking Platform (Monorepo)

A production-ready, high-concurrency **Service Booking Platform** engineered for seamless customer appointments, provider service management, and zero double-booking reliability.

---

## 🛠 Technology Stack

- **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS
- **Backend**: Node.js, Express.js (Clean Layered Architecture)
- **Database**: MySQL 8.0+
- **ORM**: Prisma ORM
- **Authentication**: JWT & bcrypt password hashing
- **Concurrency & Transaction Engine**: ACID Transactions with Row Locking & Serializable Isolation

---

## 🏛 Planned Architecture

The repository follows a clean monorepo structure:

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
│   ├── prisma/             # Prisma database schema & migrations
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/         # Environment variables & constants
│   │   ├── controllers/    # Thin HTTP request & response handlers
│   │   ├── middleware/     # Auth, RBAC, and error handlers
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # Domain business logic & transactions
│   │   ├── repositories/   # Prisma query layer
│   │   ├── validators/     # Input schema validation
│   │   ├── utils/          # Standard response and error helpers
│   │   ├── db/             # Prisma client singleton
│   │   ├── app.js          # Express app configuration
│   │   └── server.js       # Server bootstrap and graceful shutdown
│   └── package.json
│
├── database/               # Database design, SQL DDL reference, and indexing strategy
│   ├── README.md
│   └── schema.sql
│
├── docs/                   # Architectural blueprints & concurrency specifications
│   ├── ARCHITECTURE.md     # Full architectural documentation
│   └── BOOKING-CONCURRENCY.md # Double-booking & race condition prevention blueprint
│
├── .gitignore
├── .env.example
├── package.json            # Monorepo orchestration scripts
└── README.md
```

---

## 📦 Planned Modules

1. **Authentication & RBAC Module**:
   - Customer & Provider registration and login.
   - Secure bcrypt password hashing.
   - JWT token generation & verification.
   - Role-based authorization middleware.
2. **Services Catalog Module**:
   - Provider CRUD for services (duration, pricing, descriptions).
   - Customer search, category filtering, price filtering, sorting, and pagination.
3. **Double-Booking & Slot Concurrency Engine**:
   - Deterministic availability and slot schedule computation.
   - ACID transaction locking preventing simultaneous overlapping bookings.
   - Source-of-truth backend validation returning `HTTP 409 Conflict` on race conditions.
4. **Dashboards & Portals**:
   - Customer dashboard: booking history, upcoming appointment management.
   - Provider dashboard: schedule view, appointment acceptance/rejection flow.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+ or v20+ / v22+)
- npm (v9+)
- MySQL (v8.0+)

### 1. Clone & Configure Environment Variables
Copy `.env.example` to `backend/.env` and `frontend/.env.local`:
```bash
cp .env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Configure your MySQL connection string in `backend/.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/service_booking_db"
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Run Development Servers Independently

To run the **Backend API** (port 5000):
```bash
npm run dev:backend
```

To run the **Frontend Application** (port 3000):
```bash
npm run dev:frontend
```

Or run both concurrently:
```bash
npm run dev
```

---

## 🔍 Health Check Endpoint

Verify the backend is running by querying:
```http
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Service Booking API is running"
}
```

---

## 📖 Detailed Documentation

- [System Architecture Blueprint](docs/ARCHITECTURE.md)
- [Booking Concurrency & Race Condition Prevention Strategy](docs/BOOKING-CONCURRENCY.md)
- [Database Schema & Indexing Specifications](database/README.md)
