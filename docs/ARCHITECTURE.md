# System Architecture & Technical Specifications

This document outlines the architectural blueprints, technical stacks, module designs, and security policies for the **Service Booking Platform**.

---

## 1. High-Level Architecture Overview

The system is architected as a clean, decoupled Monorepo divided into a Next.js frontend client and an Express.js RESTful backend application, communicating over JSON HTTP APIs with a MySQL database layer managed by Prisma ORM.

```
┌────────────────────────────────────────────────────────┐
│               Frontend (Next.js 15+ / React)           │
│  - App Router                                          │
│  - Tailwind CSS Styling System                         │
│  - Customer & Provider Portals                         │
│  - JWT Client Auth Store & Axios/Fetch Interceptors    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend (Node.js / Express.js)           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes & Route Middlewares (Auth, Roles, Limits) │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Controllers (Thin, Request / Response Transport) │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Validators (Schema Validation, e.g., Joi / Zod)  │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Services (Domain Business Logic & Transactions)  │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Repositories (Prisma Query Access Layer)         │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │ Prisma Client
                            ▼
┌────────────────────────────────────────────────────────┐
│               Database (MySQL 8.0+)                    │
│  - users                                               │
│  - categories                                          │
│  - services                                            │
│  - bookings                                            │
└────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (`frontend/`)

### 2.1 Framework & Patterns
- **Next.js App Router (`src/app/`)**: Leverage modern React Server & Client components with optimized routing and layout nesting.
- **Design System & Styling**: Pure Tailwind CSS for custom utility-first, responsive UI components (avoiding bulky third-party component libraries).
- **State Management**:
  - React Context / Custom Hooks for Authentication & Session state.
  - SWR or TanStack React Query patterns (or lightweight custom fetchers) for server state caching, pagination, and optimistic updates.
- **Form Management & Client Validation**: Custom hook validation or React Hook Form for type-safe validation before API dispatch.

### 2.2 Component Hierarchy
```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── customer/
│   │   └── provider/
│   ├── services/
│   │   ├── [id]/
│   │   └── page.js
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ui/ (Button, Input, Modal, Badge, Card, Spinner)
│   ├── common/ (Navbar, Footer, ErrorBoundary, EmptyState)
│   ├── auth/ (LoginForm, RegisterForm, ProtectedRoute)
│   ├── services/ (ServiceCard, ServiceFilter, ServiceGrid)
│   └── bookings/ (SlotPicker, BookingModal, BookingCard)
├── hooks/
│   ├── useAuth.js
│   ├── useServices.js
│   └── useBookings.js
├── services/
│   └── api.js (Configured HTTP client with Bearer token injection)
└── utils/
    └── formatters.js
```

---

## 3. Backend Architecture (`backend/`)

The backend adheres strictly to **Clean Layered Architecture (Separation of Concerns)**:

### 3.1 Layer Responsibilities
1. **Controllers (`src/controllers/`)**:
   - Strictly thin.
   - Responsible solely for extracting HTTP parameters (`req.body`, `req.params`, `req.query`, `req.user`), calling domain services, and returning standard JSON status codes via `ApiResponse`.
2. **Services (`src/services/`)**:
   - Source of truth for business logic.
   - Enforces slot duration constraints, authorization permissions (e.g. verifying service ownership), pricing calculations, and transaction orchestration.
3. **Repositories (`src/repositories/`)**:
   - Isolates all database operations.
   - Interacts with `prisma` client directly. Ensures no database query leakage into controllers or routes.
4. **Validators (`src/validators/`)**:
   - Validates input payloads before hitting business logic.
   - Rejects malformed types, missing required attributes, and invalid email/date formats.
5. **Middleware (`src/middleware/`)**:
   - `authMiddleware.js`: Verifies JWT tokens and attaches authenticated user payload to `req.user`.
   - `roleMiddleware.js`: Enforces Role-Based Access Control (`CUSTOMER`, `PROVIDER`).
   - `errorHandler.js`: Intercepts operational and unhandled exceptions, returning structured JSON errors.
6. **Database Singleton (`src/db/prisma.js`)**:
   - Reusable PrismaClient instance configured with log levels per environment.

---

## 4. Database Architecture & Schema Design

### 4.1 Entities & Relational Design
- **`User`**: Core identity table. Supports role polymorphism (`CUSTOMER`, `PROVIDER`).
- **`Category`**: Service classification with unique slug indexing.
- **`Service`**: Provided service records containing duration, price (Decimal), category reference, and active toggle.
- **`Booking`**: Appointment booking linking customer, provider, and service with explicit status lifecycle:
  - `PENDING` -> `CONFIRMED` / `REJECTED` / `CANCELLED` / `COMPLETED`

### 4.2 Indexing Strategy
- **Users**: Unique index on `email` for rapid authentication queries.
- **Services**: Indexes on `providerId`, `categoryId`, `price`, `isActive` to accelerate faceted filtering and pagination.
- **Bookings**: Composite index on `(providerId, bookingDate, status)` and `(startTime, endTime)` for real-time schedule conflict resolution.

---

## 5. Authentication & Authorization Architecture

### 5.1 Authentication Flow
1. **Registration**: Validates input -> Hashes password with `bcrypt` (salt rounds: 10-12) -> Stores user with selected role (`CUSTOMER` or `PROVIDER`).
2. **Login**: Verifies email -> Compares `bcrypt.compare` hash -> Signs standard JWT payload:
   ```json
   {
     "id": 1,
     "email": "user@example.com",
     "role": "PROVIDER"
   }
   ```
3. **Session Verification**: Frontend attaches JWT in standard HTTP header:
   `Authorization: Bearer <token>`
4. **Protected Routing**:
   - Backend `authenticate` middleware decodes token and sets `req.user`.
   - Backend `authorize(['PROVIDER'])` guards provider-specific endpoints.

---

## 6. Booking System Architecture & Concurrency Strategy

The booking engine enforces absolute backend authority over schedule availability.

### Key Tenet: Elimination of Blind Check-Then-Insert Race Conditions
In high-concurrency environments, a naive `SELECT availability -> INSERT booking` fails when two simultaneous requests arrive in parallel.

### Solution Architecture
1. **Database Transaction (`prisma.$transaction`)** with strict locking / atomic conflict checking.
2. **Deterministic Time Slot Boundary Calculation** ensuring bookings align to normalized time windows.
3. **409 Conflict Response**: If an overlap is detected during transaction execution, the backend immediately rolls back and returns `HTTP 409 Conflict` with a user-friendly error message.

*(For detailed transaction diagrams, SQL locking semantics, and benchmark flow, see [BOOKING-CONCURRENCY.md](BOOKING-CONCURRENCY.md)).*

---

## 7. Security Approach

1. **Password Safety**: Passwords are never stored in plaintext and never returned in API responses.
2. **Zero Trust Authorization**: Resource mutation verifies both role and resource ownership (e.g. A provider cannot update another provider's service).
3. **Input Sanitization & Parameterization**: All DB queries use Prisma's parameterized engine, preventing SQL injection vulnerabilities.
4. **CORS & Headers**: Strict CORS origin whitelisting in production.
5. **Safe Error Masking**: Stack traces and raw internal error strings are stripped from production responses.

---

## 8. Deployment Approach (Vercel)

- **Frontend**: Standard Next.js Vercel deployment with environment variables (`NEXT_PUBLIC_API_URL`).
- **Backend**: Deployable as Node.js serverless functions or standalone Express server on Vercel / Railway / Render.
- **Database**: Remote managed MySQL instance (PlanetScale / AWS RDS / Aiven / Railway MySQL) connected via `DATABASE_URL`.
