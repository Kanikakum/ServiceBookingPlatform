# Booking Concurrency & Double-Booking Prevention Architecture

This document provides a comprehensive technical breakdown of how the Service Booking Platform backend guarantees zero double-bookings, even under high-frequency simultaneous parallel requests for the same provider, date, and time slot.

---

## 1. The Race Condition Problem

### 1.1 Naive Check-Then-Act Anti-Pattern
A naive booking implementation follows this sequence:

```
[Request A] ───> 1. SELECT bookings WHERE providerId = 5 AND slot = 10:00-11:00 (Count: 0)
[Request B] ───> 2. SELECT bookings WHERE providerId = 5 AND slot = 10:00-11:00 (Count: 0)
[Request A] ───> 3. INSERT INTO bookings (providerId: 5, 10:00-11:00) ───> Success (201 Created)
[Request B] ───> 4. INSERT INTO bookings (providerId: 5, 10:00-11:00) ───> Success (201 Created) [DOUBLE BOOKING BUG]
```

### 1.2 Why Naive Transactions Still Fail in MySQL InnoDB
In MySQL InnoDB, the default transaction isolation level is `REPEATABLE READ`. Under standard `REPEATABLE READ`:
1. When a transaction performs a non-locking `SELECT` (e.g. `tx.booking.findMany(...)`), InnoDB establishes an MVCC point-in-time snapshot (Read View).
2. If two concurrent transactions execute their `SELECT` at approximately the same time, both read their initial snapshots showing zero bookings.
3. Furthermore, running `SELECT ... FOR UPDATE` on an empty result set acquires **no record locks** (at best it acquires gap locks or next-key locks which can lead to deadlocks rather than clean serialization).
4. Both transactions proceed to `INSERT`, resulting in catastrophic double-booking.

---

## 2. Mathematical Definition of Time Slot Overlap

Two half-open time intervals $[A_{\text{start}}, A_{\text{end}})$ and $[B_{\text{start}}, B_{\text{end}})$ overlap if and only if:

$$\text{Overlap} \iff A_{\text{start}} < B_{\text{end}} \quad \land \quad A_{\text{end}} > B_{\text{start}}$$

### Concrete Overlap Scenarios:

| Existing Booking | Requested Slot | Overlap Condition Check | Result |
| :--- | :--- | :--- | :--- |
| 10:00 – 11:00 | 10:30 – 11:30 | $10:00 < 11:30 \land 11:00 > 10:30 \implies \text{true}$ | **OVERLAP (409 Conflict)** |
| 10:00 – 11:00 | 11:00 – 12:00 | $10:00 < 12:00 \land 11:00 > 11:00 \implies \text{false}$ | **NO OVERLAP (Permitted)** |
| 10:00 – 12:00 | 10:30 – 11:00 | $10:00 < 11:00 \land 12:00 > 10:30 \implies \text{true}$ | **OVERLAP (409 Conflict)** |
| 10:00 – 11:00 | 09:00 – 10:00 | $10:00 < 10:00 \land 11:00 > 09:00 \implies \text{false}$ | **NO OVERLAP (Permitted)** |

---

## 3. Which Booking Statuses Block Availability?

To balance business rules and calendar availability:

- **Blocking Statuses** (Occupies Provider Time):
  - `PENDING`: The booking has been placed and is awaiting provider confirmation. It reserves the slot so no other customer can book it.
  - `CONFIRMED`: The provider has accepted the booking. The slot remains occupied.

- **Non-Blocking Statuses** (Slot is Released):
  - `REJECTED`: The provider declined the booking request. The slot is immediately freed for other customers.
  - `CANCELLED`: The customer cancelled an active booking. The slot is immediately freed.
  - `COMPLETED`: The appointment was fulfilled in the past.

---

## 4. Production Concurrency & Locking Strategy

To eliminate race conditions completely, our backend implements an **ACID Transaction with Stable Parent Row Pessimistic Locking** under `ReadCommitted` transaction isolation in MySQL InnoDB via Prisma.

### 4.1 Step-by-Step Transaction Flow

```
Customer A (Slot 16:00 - 17:00)                    Customer B (Slot 16:00 - 17:00)
       │                                                  │
       ▼                                                  ▼
[POST /api/bookings]                               [POST /api/bookings]
       │                                                  │
       ▼                                                  ▼
[Begin ACID Transaction]                           [Begin ACID Transaction]
(Isolation: ReadCommitted)                         (Isolation: ReadCommitted)
       │                                                  │
       ▼                                                  │
[Step 1: SELECT id FROM users                     [Step 1: SELECT id FROM users
 WHERE id = providerId FOR UPDATE]                 WHERE id = providerId FOR UPDATE]
       │                                                  │
       ▼ (Acquires Exclusive Lock)                        ▼ (BLOCKED / Queued in InnoDB)
[Step 2: Read active bookings                             │
 for provider on bookingDate]                             │
       │                                                  │
       ▼ (Count = 0 conflicts)                            │
[Step 3: INSERT INTO bookings                             │
 (status = 'PENDING', price snapshot)]                    │
       │                                                  │
       ▼                                                  │
[Step 4: COMMIT Transaction A]                            │
       │ (Releases Lock on provider User row)             │
       ▼                                                  ▼ (Lock Acquired by Transaction B)
HTTP 201 Created                                   [Step 2: Read active bookings]
                                                          │ (Reads fresh committed data)
                                                          ▼
                                                   Found 1 conflicting booking!
                                                          │
                                                          ▼
                                                   [Step 3: ROLLBACK Transaction B]
                                                          │
                                                          ▼
                                                   HTTP 409 Conflict
                                                   {"success": false, "message": "The selected time slot is no longer available."}
```

### 4.2 Why This Strategy Guarantees Correctness
1. **Stable Existing Lock Target**: The `users` row with `id = providerId` is guaranteed to exist as long as the provider exists. Unlike locking on `bookings` (which may be empty), locking an existing primary key row with `SELECT ... FOR UPDATE` acquires an immediate, deterministic exclusive row lock in InnoDB.
2. **Deterministic Serialization**: All concurrent booking requests for the same provider are serialized at the database lock queue.
3. **ReadCommitted Freshness**: Because the transaction runs under `ReadCommitted` isolation, once Transaction B acquires the lock, its subsequent read of `bookings` sees the newly committed row from Transaction A, detecting the overlap immediately and aborting with a clean `409 Conflict`.
4. **No Deadlocks**: Because every booking transaction locks the provider row first before any child rows, there is no circular lock dependency across concurrent transactions.

---

## 5. Booking Price Snapshotting

To ensure financial and historical data integrity:
- When a booking is created, `totalPrice` is snapshotted from the `service.price` column at the moment of booking creation.
- If the provider later modifies the service price (e.g. from ₹999 to ₹1499), existing past and upcoming bookings retain their original booked `totalPrice` (₹999).
- Historical booking prices are never dynamically computed from current service prices.

---

## 6. Automated Concurrency Test Verification

The concurrency protection mechanism is verified via automated stress testing in `backend/tests/booking.test.js`.

### 6.1 Test Methodology
1. Seed a test provider, service, and two distinct customers with valid JWT tokens.
2. Formulate 10 simultaneous HTTP POST requests targeting the **exact same provider, date, and time slot** (`16:00 - 17:00`).
3. Dispatch all 10 requests concurrently using `Promise.all(...)` to trigger real parallel execution on Node.js and MySQL:

```javascript
const parallelTenRequests = Array.from({ length: 10 }, (_, index) => {
  const token = index % 2 === 0 ? tokenCust1 : tokenCust2;
  return request(
    'POST',
    '/api/bookings',
    { serviceId: service.id, bookingDate: futureDateStr, startTime: '16:00' },
    token
  );
});

const tenResults = await Promise.all(parallelTenRequests);
```

### 6.2 Test Results
- **201 Created count**: `1`
- **409 Conflict count**: `9`
- **Database verification**: Querying `SELECT * FROM bookings WHERE providerId = ? AND bookingDate = ? AND startTime = ? AND status IN ('PENDING', 'CONFIRMED')` returns **exactly 1 row**.

```
--- SECTION 6: CONCURRENCY & RACE CONDITION PREVENTION ---
Executing 2 simultaneous parallel requests for slot 15:00...
✅ [PASS] 28. Simultaneous 2-request race condition: Exactly 1 succeeds (201) and 1 is rejected (409 Conflict)
✅ [PASS] 29. MySQL Database verification: Exactly ONE active booking row exists in database for slot 15:00

Executing 10 SIMULTANEOUS parallel requests for slot 16:00...
✅ [PASS] 30. High-load Concurrency Stress Test: 10 parallel requests -> Exactly 1 succeeds (201) and 9 receive 409 Conflict
✅ [PASS] 31. MySQL Database verification: Exactly ONE active booking row exists in database for slot 16:00 after 10 concurrent requests
```

---

## 7. Database Indexes for Booking Performance

To support sub-millisecond slot queries and efficient locking, the following indexes are defined in `backend/prisma/schema.prisma`:

```prisma
model Booking {
  // ... fields ...

  @@index([providerId, bookingDate, status], name: "idx_bookings_provider_date_status")
  @@index([customerId, bookingDate, status], name: "idx_bookings_customer_date_status")
  @@index([serviceId], name: "idx_bookings_service")
  @@map("bookings")
}
```

These compound indexes allow MySQL InnoDB to perform index-range scans directly on `(providerId, bookingDate, status)` during overlap detection, eliminating table scans and minimizing lock hold duration.
