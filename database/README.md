# Database Design & Planning

This directory contains the database design specifications, SQL schema definition, and index optimization strategy for the Service Booking Platform.

---

## 1. Relational Entities Overview

The database is built on **MySQL 8.0+** managed via **Prisma ORM**.

```
+------------------+         +--------------------+         +-------------------+
|      users       | 1     * |      services      | *     1 |    categories     |
+------------------+---------+--------------------+---------+-------------------+
| id (PK)          |         | id (PK)            |         | id (PK)           |
| name             |         | providerId (FK)    |         | name (UNIQUE)     |
| email (UNIQUE)   |         | categoryId (FK)    |         | slug (UNIQUE)     |
| passwordHash     |         | title              |         | createdAt         |
| role             |         | description        |         | updatedAt         |
| createdAt        |         | price              |         +-------------------+
| updatedAt        |         | durationMinutes    |
+------------------+         | isActive           |
        | 1                  | createdAt          |
        |                    | updatedAt          |
        |                    +--------------------+
        |                              | 1
        | *                            | *
+-----------------------------------------------+
|                   bookings                    |
+-----------------------------------------------+
| id (PK)                                       |
| customerId (FK -> users.id)                   |
| providerId (FK -> users.id)                   |
| serviceId (FK -> services.id)                 |
| bookingDate (DATE)                            |
| startTime (DATETIME)                          |
| endTime (DATETIME)                            |
| status (PENDING|CONFIRMED|REJECTED|CANCELLED) |
| createdAt                                     |
| updatedAt                                     |
+-----------------------------------------------+
```

---

## 2. Integrity & Relational Constraints

1. **User Table (`users`)**:
   - `email` is strictly unique (`UNIQUE INDEX`).
   - `role` is constrained to `ENUM('CUSTOMER', 'PROVIDER')`.

2. **Service Table (`services`)**:
   - `providerId` foreign key references `users(id)` with `ON DELETE CASCADE`.
   - `categoryId` foreign key references `categories(id)` with `ON DELETE RESTRICT`.
   - `price` stored as `DECIMAL(10, 2)` to avoid floating-point rounding inaccuracies.
   - `durationMinutes` stored as integer (e.g., 30, 45, 60).

3. **Booking Table (`bookings`)**:
   - `customerId` foreign key references `users(id)` with `ON DELETE RESTRICT`.
   - `providerId` foreign key references `users(id)` with `ON DELETE RESTRICT`.
   - `serviceId` foreign key references `services(id)` with `ON DELETE RESTRICT`.
   - `status` is constrained to `ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED')`.

---

## 3. Database Indexes & Query Optimization

| Table | Index | Type | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `email` | UNIQUE | Fast O(1) user lookups during authentication |
| `categories` | `slug` | UNIQUE | Fast route/category resolution |
| `services` | `providerId` | BTREE | Fast retrieval of services created by a provider |
| `services` | `categoryId` | BTREE | Category filtering in catalog |
| `services` | `price` | BTREE | Price range filtering and sorting |
| `services` | `isActive` | BTREE | Filter active services for public customer browsing |
| `bookings` | `(providerId, bookingDate, status)` | COMPOSITE | High-speed availability queries and slot conflict checks |
| `bookings` | `(startTime, endTime)` | COMPOSITE | Time-range overlap validation |
| `bookings` | `customerId` | BTREE | Fast retrieval of customer booking history |
| `bookings` | `serviceId` | BTREE | Service booking aggregation and analytics |

---

## 4. Concurrency & Overlap Prevention

For full details on the transaction isolation levels, row locking, and simultaneous booking conflict handling, see [`docs/BOOKING-CONCURRENCY.md`](../docs/BOOKING-CONCURRENCY.md).
