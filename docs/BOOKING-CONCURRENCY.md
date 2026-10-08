# Booking Concurrency & Double-Booking Prevention Strategy

This document details the architectural and database design strategy to eliminate race conditions, duplicate bookings, overlapping slots, and simultaneous booking conflicts.

---

## 1. The Race Condition Problem

A naive booking flow looks like this:

```
[Customer A] ────────> 1. SELECT overlapping bookings for Provider P in [T1, T2] (Found: 0)
[Customer B] ───> 2. SELECT overlapping bookings for Provider P in [T1, T2] (Found: 0)
[Customer A] ────────> 3. INSERT Booking (T1, T2) -> Success!
[Customer B] ───> 4. INSERT Booking (T1, T2) -> Success! (DOUBLE BOOKING BUG)
```

In high-concurrency environments, because Steps 1 & 2 execute before either transaction commits an insert, both customers read 0 conflicts and both insert bookings for the exact same provider and time window.

---

## 2. Mathematical Definition of Time Slot Overlap

Two intervals $[A_{\text{start}}, A_{\text{end}}]$ and $[B_{\text{start}}, B_{\text{end}}]$ overlap if and only if:

$$\text{Overlap} \iff A_{\text{start}} < B_{\text{end}} \quad \text{AND} \quad A_{\text{end}} > B_{\text{start}}$$

For a requested slot `[reqStartTime, reqEndTime]` for provider `providerId`, an existing booking conflicts if:

```sql
status NOT IN ('CANCELLED', 'REJECTED')
AND providerId = :targetProviderId
AND startTime < :reqEndTime
AND endTime > :reqStartTime
```

---

## 3. Concurrency Strategy: Transactional Row Locking

To achieve zero double-booking under high simultaneous load, we implement an **ACID Transaction with Mutex / Row-Level Locking** at the database layer.

### Strategy Mechanism:

```
Customer A (Slot X)                          Customer B (Slot X)
      │                                            │
      ▼                                            ▼
[Begin Transaction A]                        [Begin Transaction B]
      │                                            │
      ▼                                            ▼
[Acquire Provider Lock / Exclusive Check]   [Waits for Lock on Provider / Slot]
SELECT FOR UPDATE on active bookings               │
for Provider P on Target Date                      │
      │                                            │
      ▼                                            │
Overlap Check: 0 Conflicting Rows                  │
      │                                            │
      ▼                                            │
INSERT INTO bookings (status: PENDING)             │
      │                                            │
      ▼                                            │
[Commit Transaction A]                             ▼
      │                                     [Acquires Lock]
      ▼                                     SELECT active bookings (Found: 1 conflict)
HTTP 201 Created                                   │
                                                   ▼
                                            [Rollback Transaction B]
                                                   │
                                                   ▼
                                            HTTP 409 Conflict
                                            {"success": false, "message": "Time slot already booked"}
```

---

## 4. Implementation Design in Prisma & MySQL

### Option A: Interactive Transaction with Serializable / Raw Mutex Lock (`SELECT ... FOR UPDATE`)

Using Prisma's interactive transaction:

```javascript
const createBookingWithConcurrencyProtection = async ({
  customerId,
  providerId,
  serviceId,
  bookingDate,
  startTime,
  endTime,
}) => {
  return await prisma.$transaction(
    async (tx) => {
      // 1. Lock the provider's active bookings on the given date for update
      // This forces concurrent booking attempts for this provider to queue deterministically
      const conflictingBookings = await tx.$queryRaw`
        SELECT id FROM bookings
        WHERE providerId = ${providerId}
          AND bookingDate = ${bookingDate}
          AND status IN ('PENDING', 'CONFIRMED')
          AND startTime < ${endTime}
          AND endTime > ${startTime}
        FOR UPDATE
      `;

      // 2. Evaluate conflict
      if (conflictingBookings.length > 0) {
        throw new AppError(
          'The requested time slot has already been reserved or conflicts with an existing booking.',
          409 // HTTP 409 Conflict
        );
      }

      // 3. Insert the new booking
      const newBooking = await tx.booking.create({
        data: {
          customerId,
          providerId,
          serviceId,
          bookingDate,
          startTime,
          endTime,
          status: 'PENDING',
        },
        include: {
          service: true,
          provider: { select: { id: true, name: true, email: true } },
        },
      });

      return newBooking;
    },
    {
      isolationLevel: 'Serializable', // Highest isolation level guaranteeing serial consistency
      timeout: 10000, // 10s maximum lock wait timeout
    }
  );
};
```

---

## 5. API Conflict Response Contract (HTTP 409 Conflict)

When a simultaneous race condition occurs, the losing request receives:

- **Status Code**: `409 Conflict`
- **Payload**:
```json
{
  "success": false,
  "message": "The selected time slot is no longer available. Please select another slot.",
  "errors": {
    "code": "SLOT_CONFLICT",
    "providerId": 4,
    "requestedSlot": {
      "startTime": "2026-10-10T10:00:00.000Z",
      "endTime": "2026-10-10T11:00:00.000Z"
    }
  }
}
```

---

## 6. Frontend Concurrency Handling & UX

1. **Optimistic UI Feedback**: Display disabled / booked state immediately upon slot selection.
2. **Graceful 409 Error Handling**: When receiving a 409 from the backend:
   - Display a clear toast or banner alert: *"Someone just booked this slot. Schedule updated."*
   - Automatically trigger a background slot refresh (`mutate()` / re-fetch) to update available slot pills in real time.
3. **Double Click Prevention**: Disable the "Confirm Booking" button immediately on submission to prevent accidental rapid double-dispatch.

---

## 7. Performance & Index Optimization

The database index on:
```sql
CREATE INDEX `idx_bookings_provider_date_status` 
ON `bookings` (`providerId`, `bookingDate`, `status`);
```
ensures that the `FOR UPDATE` query scans only rows matching the exact provider and date, preventing table-level lock contention and keeping the transaction lock duration under a few milliseconds.
