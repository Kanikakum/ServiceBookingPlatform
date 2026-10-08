# Service Booking Platform

A production-ready, full-stack **Service Booking Platform** engineered with Next.js 16, Node.js/Express, Prisma ORM, and MySQL. Features customer service discovery, real-time availability scheduling, provider dashboard & service management, and an ACID transaction engine guaranteeing **zero double-bookings under high concurrency**.

---

## 🚀 Key Features

### 🔐 Authentication & Role-Based Access Control
- **Customer & Provider Roles**: Segregated user journeys with strict frontend route protection and backend RBAC middleware.
- **Secure Authentication**: Bcrypt password hashing (salt rounds = 12) and JWT token authentication.
- **Persistent State**: Token management with automated session restoration, cross-tab synchronization, and 401 handling.

### 🛍 Customer Marketplace & Discovery
- **Search & Filtering**: Full-text keyword search across titles and descriptions, multi-category filtering, and min/max price range controls.
- **Sorting & Server-Side Pagination**: Instant sorting by newest, oldest, price ascending, and price descending with server-side pagination.
- **Interactive Service Detail**: View comprehensive service specifications, pricing, duration, and provider information.

### 📅 Booking Engine & Double-Booking Prevention
- **Dynamic Slot Generation**: Real-time slot availability picker with visual status badges (Available, Booked, Past).
- **Concurrency & Double-Booking Protection**: MySQL InnoDB exclusive pessimistic row locking (`SELECT ... FOR UPDATE` under `ReadCommitted` transaction isolation) guaranteeing zero double-bookings even under 10+ simultaneous requests for the exact same slot.
- **Price Snapshotting**: Immutable `totalPrice` recorded at the moment of booking creation, protecting historical records from future price updates.
- **State Machine Transitions**: Unidirectional status lifecycle (`PENDING` $\rightarrow$ `CONFIRMED` / `REJECTED`, or `CANCELLED`).
- **Customer Bookings Hub**: Filterable bookings view (`All`, `Pending`, `Confirmed`, `Cancelled`, `Past`) with cancellation controls.

### 💼 Provider Dashboard & Service Management
- **Live KPI Dashboard**: Real-time business metrics (Total Services, Active Services, Pending Requests, Confirmed Appointments, Upcoming Slots).
- **Service CRUD**: Reusable creation and editing forms with live category selection, price/duration adjustments, and soft-deactivation (`isActive: false`).
- **Booking Requests Queue**: Review incoming customer requests with one-click **Accept** (`CONFIRMED`) and confirmation-dialog **Decline** (`REJECTED`).
- **Work Schedule Timeline**: Chronological agenda of confirmed and upcoming appointments grouped by calendar date.

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS |
| **Backend** | Node.js, Express.js (Clean Layered Architecture) |
| **Database** | MySQL 8.0+ |
| **ORM** | Prisma ORM |
| **Validation** | Zod (strict schema validation) |
| **Authentication** | JWT (`jsonwebtoken`) & bcryptjs |
| **Concurrency Engine** | MySQL InnoDB ACID Transactions with Row Locking |

---

## 🏛 System Architecture

The application follows a clean layered architecture with a clear separation of concerns:

```
[ Next.js 16 Frontend UI ]
         │
         ▼ (HTTP / JSON + Bearer JWT)
[ Centralized API Client (apiClient.js) ]
         │
         ▼
[ Express.js REST API (Port 5000) ]
         │
         ├───▶ [ CORS & Security Middleware ]
         ├───▶ [ JWT Authentication & RBAC (authenticate, requireRole) ]
         ├───▶ [ Request Validation (Zod Schemas) ]
         │
         ▼
[ Controller Layer (HTTP Request/Response Handling) ]
         │
         ▼
[ Service Layer (Business Logic & Transactions) ]
         │
         ▼
[ Repository Layer (Prisma Data Access) ]
         │
         ▼
[ MySQL 8.0+ Database (Pessimistic Locking & ACID Engine) ]
```

---

## 📁 Project Structure

```text
service-booking-platform/
├── frontend/                     # Next.js App Router client application
│   ├── src/
│   │   ├── app/                  # Routes: /, /services, /customer, /provider, etc.
│   │   ├── components/           # UI, Auth, Bookings, Provider components
│   │   ├── context/              # AuthContext (React context + JWT session)
│   │   ├── lib/                  # apiClient, auth, serviceApi, bookingApi, providerApi
│   │   └── utils/                # routes.js, constants, formatters
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend scripts & dependencies
│   └── next.config.mjs
│
├── backend/                      # Express.js REST API server
│   ├── prisma/                   # Prisma schema, migrations, and seed scripts
│   │   ├── schema.prisma         # Models: User, Category, Service, Booking, Lock
│   │   ├── seed.js               # Idempotent category seed data
│   │   └── migrations/           # Versioned SQL migration history
│   ├── src/
│   │   ├── config/               # Environment & CORS configuration
│   │   ├── controllers/          # Express route controllers
│   │   ├── middleware/           # Auth, RBAC, errorHandler, notFoundHandler
│   │   ├── routes/               # API route definitions (/auth, /services, /bookings, /categories)
│   │   ├── services/             # Core business logic & ACID transaction engine
│   │   ├── repositories/         # Prisma database access layer
│   │   ├── validators/           # Zod schema definitions
│   │   ├── app.js                # Express app configuration
│   │   └── server.js             # HTTP server entrypoint
│   ├── tests/                    # Automated regression & concurrency test suites
│   │   ├── auth.test.js          # Phase 1: 24 tests
│   │   ├── service.test.js       # Phase 2: 34 tests
│   │   └── booking.test.js       # Phase 3: 28 tests (concurrency & stress tests)
│   └── package.json
│
├── docs/                         # Architecture, API & Database documentation
│   ├── API.md                    # REST API specifications & endpoint contracts
│   ├── ARCHITECTURE.md           # Deep-dive system architecture
│   ├── BOOKING-CONCURRENCY.md    # Double-booking & race condition prevention
│   └── DATABASE-SCHEMA.md        # Database tables, relationships, and index strategy
│
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json                  # Root monorepo orchestration scripts
└── README.md
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js**: v18+ or v20+ / v22+
- **npm**: v9+
- **MySQL Server**: v8.0+ running locally or in Docker

---

### Step 1: Clone & Install Dependencies
```bash
git clone <repository-url>
cd service-booking-platform

# Install root, backend, and frontend dependencies
npm run install:all
```

---

### Step 2: Configure Environment Variables
Copy `.env.example` into `backend/.env` and `frontend/.env.local`:

```bash
# Backend configuration
cp .env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env` to configure your MySQL connection:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
DATABASE_URL="mysql://root:password@localhost:3306/service_booking_db"
JWT_SECRET="super-secret-jwt-key-min-32-chars-long"
JWT_EXPIRES_IN="7d"
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

---

### Step 3: Run Database Migrations & Seed Data
```bash
# Apply Prisma migrations to your MySQL database
npm run prisma:migrate

# Seed default categories (Home Cleaning, Plumbing, Electrical, etc.)
npm run prisma:seed
```

---

### Step 4: Run Automated Tests
Execute the full test suite (86 automated tests across Auth, Services, and Bookings):
```bash
# Run all 86 backend tests
npm run test:backend

# Or run individual phase suites
npm run test:auth       # 24 tests
npm run test:service    # 34 tests
npm run test:booking    # 28 tests (includes 10-concurrent-request stress test)
```

---

### Step 5: Start Development Servers
```bash
# Run backend and frontend concurrently
npm run dev

# Or run them in separate terminals:
npm run dev:backend     # Express API on http://localhost:5000
npm run dev:frontend    # Next.js App on http://localhost:3000
```

Access the frontend application at: **`http://localhost:3000`**  
Access the backend API health check at: **`http://localhost:5000/api/health`**

---

## 🎯 Demo User Flow for Evaluation

### Customer User Journey:
1. Navigate to `http://localhost:3000/register` $\rightarrow$ Select **Customer Account**.
2. Register and log in.
3. Browse the **Services Marketplace** (`/services`), search for keywords, filter by category/price, and sort.
4. Click on a service to open its detail page (`/services/:id`).
5. Select a future date and choose an **Available Time Slot**.
6. Confirm booking $\rightarrow$ View newly placed booking in **My Bookings** (`/customer/bookings`).
7. Test cancellation: Click **Cancel** on a pending or confirmed booking $\rightarrow$ Status changes to `CANCELLED` and time slot is immediately released.

### Provider User Journey:
1. Navigate to `http://localhost:3000/register` $\rightarrow$ Select **Service Provider Account**.
2. Register and log in $\rightarrow$ You are routed to the **Provider Dashboard** (`/provider`).
3. Click **Add New Service** (`/provider/services/new`) $\rightarrow$ Create a service offering (Category, Title, Price, Duration, Description).
4. View your listings in **My Services** (`/provider/services`) $\rightarrow$ Test editing price/duration or deactivating a service.
5. In another browser or incognito window, place a booking as a Customer for this Provider.
6. Return to Provider $\rightarrow$ Go to **Booking Requests** (`/provider/bookings`).
7. Click **Accept** $\rightarrow$ Status transitions from `PENDING` to `CONFIRMED`.
8. Check the **Work Schedule** (`/provider/schedule`) $\rightarrow$ Appointment appears in the chronological timeline.

---

## 🔒 Concurrency & Double-Booking Prevention

### The Challenge
When multiple customers attempt to book the same provider slot simultaneously, standard `SELECT` then `INSERT` logic creates catastrophic double-bookings due to non-blocking snapshot reads in MVCC.

### Our Solution
1. **Pessimistic Row Locking**: Within an explicit MySQL ACID transaction (`ReadCommitted` isolation), the backend acquires an exclusive row lock on the provider:
   ```sql
   SELECT id FROM users WHERE id = :providerId FOR UPDATE;
   ```
2. **Deterministic Serialization**: All parallel requests targeting the same provider are queued deterministically at the database lock level.
3. **Overlap Query**:
   ```sql
   SELECT * FROM bookings 
   WHERE providerId = :providerId 
     AND bookingDate = :date 
     AND status IN ('PENDING', 'CONFIRMED')
     AND startTime < :reqEndTime 
     AND endTime > :reqStartTime;
   ```
4. **Result**: The first transaction commits successfully (`201 Created`). All subsequent concurrent transactions detect the newly committed booking and immediately abort with `409 Conflict`.

Verified via 10 simultaneous parallel requests in `backend/tests/booking.test.js`:
- **Success (`201 Created`)**: Exactly `1`
- **Conflict (`409 Conflict`)**: Exactly `9`
- **Database Active Rows**: Exactly `1`

---

## 📡 REST API Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server health status |
| `POST` | `/api/auth/register` | Public | Register Customer or Provider |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/categories` | Public | List all active service categories |
| `GET` | `/api/services` | Public | Search, filter, sort & paginate catalog |
| `GET` | `/api/services/:id` | Public | Get single service details |
| `POST` | `/api/services` | Provider | Create new service offering |
| `GET` | `/api/services/provider/me` | Provider | List provider's own services |
| `PUT` | `/api/services/:id` | Provider | Update owned service |
| `DELETE` | `/api/services/:id` | Provider | Soft-deactivate owned service |
| `GET` | `/api/bookings/availability` | Authenticated | Advisory time slot availability |
| `POST` | `/api/bookings` | Customer | Concurrency-safe booking creation |
| `GET` | `/api/bookings/customer` | Customer | List customer booking history |
| `PATCH` | `/api/bookings/:id/cancel` | Customer | Cancel customer booking |
| `GET` | `/api/bookings/provider` | Provider | List provider incoming bookings |
| `PATCH` | `/api/bookings/:id/accept` | Provider | Confirm pending booking |
| `PATCH` | `/api/bookings/:id/reject` | Provider | Decline pending booking |

For detailed request/response schemas, see [docs/API.md](docs/API.md).

---

## 🚢 Production Deployment

### Frontend Deployment (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed backend (e.g. `https://api.yourdomain.com/api`).
4. Deploy. Next.js 16 App Router builds with zero warnings or errors.

### Backend Deployment (Node.js / Render / Railway / Docker)
1. Deploy the `backend` folder as a persistent Node.js service (e.g. on Railway, Render, AWS ECS, or DigitalOcean).
2. Configure Environment Variables:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
   JWT_SECRET="secure-random-32-character-secret"
   JWT_EXPIRES_IN="7d"
   CORS_ORIGIN="https://your-frontend.vercel.app"
   ```
3. Run migrations on startup: `npx prisma migrate deploy`.
4. Start the server: `node src/server.js`.

---

## 🧪 Verification & Build Results

### Next.js Production Build
```text
✓ Compiled successfully in 1470ms
✓ Generating static pages (17/17) in 946ms
Result: 0 ERRORS, 0 WARNINGS
```

### Backend Automated Test Suites
```text
PHASE 1 AUTHENTICATION & RBAC: 24 PASSED, 0 FAILED
PHASE 2 SERVICE MANAGEMENT:    34 PASSED, 0 FAILED
PHASE 3 BOOKINGS & CONCURRENCY: 28 PASSED, 0 FAILED

COMBINED TOTAL: 86 PASSED, 0 FAILED
```

---

## 📚 Further Documentation

- 📖 [REST API Documentation](docs/API.md)
- 🏗 [System Architecture Blueprint](docs/ARCHITECTURE.md)
- 🔒 [Booking Concurrency & Row Locking Strategy](docs/BOOKING-CONCURRENCY.md)
- 🗄 [Database Schema & Indexing Specifications](docs/DATABASE-SCHEMA.md)
