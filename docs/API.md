# API Documentation

Comprehensive REST API documentation for the Service Booking Platform backend.

**Base URL**: `http://localhost:5000/api`

---

## 1. System Health

### `GET /health`
Verify server status.

- **Auth**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Service Booking API is running"
  }
  ```

---

## 2. Authentication & Authorization (`/auth`)

### `POST /auth/register`
Register a new Customer or Provider account.

- **Auth**: None
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "StrongPassword123!",
    "role": "PROVIDER"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "PROVIDER",
        "createdAt": "2026-10-08T10:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Validation failure (weak password, invalid email format, missing fields).
  - `409 Conflict`: Email already registered.

---

### `POST /auth/login`
Authenticate an existing user.

- **Auth**: None
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "PROVIDER",
        "createdAt": "2026-10-08T10:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Missing credentials.
  - `401 Unauthorized`: Generic error `"Invalid email or password"`.

---

### `GET /auth/me`
Retrieve authenticated user profile.

- **Auth**: `Bearer <JWT>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "PROVIDER",
        "createdAt": "2026-10-08T10:00:00.000Z"
      }
    }
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Missing, invalid, or expired JWT.

---

## 3. Categories (`/categories`)

### `GET /categories`
Retrieve all available service categories.

- **Auth**: None (Public)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Categories retrieved successfully",
    "data": {
      "categories": [
        { "id": 1, "name": "Appliance Repair", "slug": "appliance-repair" },
        { "id": 2, "name": "Beauty & Wellness", "slug": "beauty-wellness" },
        { "id": 3, "name": "Car Wash", "slug": "car-wash" },
        { "id": 4, "name": "Electrical", "slug": "electrical" },
        { "id": 5, "name": "Fitness", "slug": "fitness" },
        { "id": 6, "name": "Home Cleaning", "slug": "home-cleaning" },
        { "id": 7, "name": "Plumbing", "slug": "plumbing" },
        { "id": 8, "name": "Tutoring", "slug": "tutoring" }
      ]
    }
  }
  ```

---

## 4. Services (`/services`)

### `GET /services`
Public marketplace catalog for active services with search, category filtering, price filtering, sorting, and pagination.

- **Auth**: None (Public)
- **Query Parameters**:
  - `search` *(string, optional)*: Keyword search against `title` and `description`.
  - `categoryId` *(number, optional)*: Filter by Category ID.
  - `minPrice` *(number, optional)*: Filter services with price `>= minPrice`.
  - `maxPrice` *(number, optional)*: Filter services with price `<= maxPrice`.
  - `sort` *(string, optional)*: `newest` (default), `oldest`, `price_asc`, `price_desc`.
  - `page` *(number, optional)*: Page number (default: `1`).
  - `limit` *(number, optional)*: Items per page (default: `10`, max: `50`).
- **Example Request**:
  `GET /api/services?search=cleaning&categoryId=6&minPrice=500&maxPrice=2000&sort=price_asc&page=1&limit=10`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Services retrieved successfully",
    "data": {
      "items": [
        {
          "id": 1,
          "providerId": 5,
          "categoryId": 6,
          "title": "Deluxe Apartment Deep Cleaning",
          "description": "Comprehensive top-to-bottom sanitization and dusting.",
          "price": 1500,
          "durationMinutes": 180,
          "isActive": true,
          "createdAt": "2026-10-08T10:30:00.000Z",
          "updatedAt": "2026-10-08T10:30:00.000Z",
          "category": {
            "id": 6,
            "name": "Home Cleaning",
            "slug": "home-cleaning"
          },
          "provider": {
            "id": 5,
            "name": "Jane Doe"
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 1,
        "totalPages": 1
      }
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Invalid filter format, limit > 50, or non-allowlist sort field.

---

### `GET /services/provider/me`
List services created by the authenticated Provider.

- **Auth**: `Bearer <JWT>`
- **Role**: `PROVIDER` only
- **Query Parameters**:
  - `page` *(number, optional)*: Default `1`.
  - `limit` *(number, optional)*: Default `10`, max `50`.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Provider services retrieved successfully",
    "data": {
      "items": [
        {
          "id": 1,
          "providerId": 5,
          "categoryId": 6,
          "title": "Deluxe Apartment Deep Cleaning",
          "description": "Comprehensive top-to-bottom sanitization and dusting.",
          "price": 1500,
          "durationMinutes": 180,
          "isActive": true,
          "createdAt": "2026-10-08T10:30:00.000Z",
          "updatedAt": "2026-10-08T10:30:00.000Z",
          "category": {
            "id": 6,
            "name": "Home Cleaning",
            "slug": "home-cleaning"
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 1,
        "totalPages": 1
      }
    }
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Authenticated user role is not `PROVIDER`.

---

### `POST /services`
Create a new service.

- **Auth**: `Bearer <JWT>`
- **Role**: `PROVIDER` only
- **Body**:
  ```json
  {
    "categoryId": 6,
    "title": "Deluxe Apartment Deep Cleaning",
    "description": "Comprehensive top-to-bottom sanitization and dusting for modern homes.",
    "price": 1500,
    "durationMinutes": 180
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Service created successfully",
    "data": {
      "id": 1,
      "providerId": 5,
      "categoryId": 6,
      "title": "Deluxe Apartment Deep Cleaning",
      "description": "Comprehensive top-to-bottom sanitization and dusting for modern homes.",
      "price": 1500,
      "durationMinutes": 180,
      "isActive": true,
      "createdAt": "2026-10-08T10:30:00.000Z",
      "updatedAt": "2026-10-08T10:30:00.000Z",
      "category": {
        "id": 6,
        "name": "Home Cleaning",
        "slug": "home-cleaning"
      }
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Validation failure (negative price, duration <= 0, title too short/long).
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Authenticated user is not a `PROVIDER`.
  - `404 Not Found`: `categoryId` does not exist in database.

---

### `GET /services/:id`
Retrieve detailed view of a single service.

- **Auth**: Public / Optional JWT (allows owning provider to view deactivated service).
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Service details retrieved successfully",
    "data": {
      "service": {
        "id": 1,
        "providerId": 5,
        "categoryId": 6,
        "title": "Deluxe Apartment Deep Cleaning",
        "description": "Comprehensive top-to-bottom sanitization and dusting for modern homes.",
        "price": 1500,
        "durationMinutes": 180,
        "isActive": true,
        "createdAt": "2026-10-08T10:30:00.000Z",
        "updatedAt": "2026-10-08T10:30:00.000Z",
        "category": {
          "id": 6,
          "name": "Home Cleaning",
          "slug": "home-cleaning"
        },
        "provider": {
          "id": 5,
          "name": "Jane Doe"
        }
      }
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Invalid service ID parameter.
  - `404 Not Found`: Service not found or inactive service requested publicly.

---

### `PUT /services/:id`
Update a service owned by the authenticated Provider.

- **Auth**: `Bearer <JWT>`
- **Role**: `PROVIDER` only
- **Body**: *(at least one field)*
  ```json
  {
    "title": "Deluxe Apartment Deep Cleaning (Updated)",
    "price": 1650,
    "durationMinutes": 200
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Service updated successfully",
    "data": {
      "service": {
        "id": 1,
        "providerId": 5,
        "categoryId": 6,
        "title": "Deluxe Apartment Deep Cleaning (Updated)",
        "description": "Comprehensive top-to-bottom sanitization and dusting for modern homes.",
        "price": 1650,
        "durationMinutes": 200,
        "isActive": true,
        "createdAt": "2026-10-08T10:30:00.000Z",
        "updatedAt": "2026-10-08T10:45:00.000Z"
      }
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Empty payload or invalid fields.
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Authenticated user does not own this service.
  - `404 Not Found`: Service or new category not found.

---

### `DELETE /services/:id`
Soft-delete / deactivate a service owned by the authenticated Provider.

- **Auth**: `Bearer <JWT>`
- **Role**: `PROVIDER` only
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Service deactivated successfully"
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Authenticated user does not own this service.
  - `404 Not Found`: Service not found.

---

## 5. Bookings (`/bookings`)

### State Transition Machine
Bookings progress through strict unidirectional server-controlled transitions:
- `PENDING` -> `CONFIRMED` (via `PATCH /api/bookings/:id/accept` by Provider)
- `PENDING` -> `REJECTED` (via `PATCH /api/bookings/:id/reject` by Provider)
- `PENDING` / `CONFIRMED` -> `CANCELLED` (via `PATCH /api/bookings/:id/cancel` by Customer)
- Terminal statuses (`REJECTED`, `CANCELLED`, `COMPLETED`) cannot transition to any other status.
- Blocking statuses: Only `PENDING` and `CONFIRMED` bookings occupy calendar slots and block provider availability.

---

### `GET /bookings/availability`
Advisory availability check returning all generated time slots for a service and date.

- **Auth**: `Bearer <JWT>`
- **Role**: `CUSTOMER` or `PROVIDER`
- **Query Parameters**:
  - `serviceId` *(number, required)*: Service ID to check.
  - `bookingDate` *(string, required)*: Date in `YYYY-MM-DD` format.
- **Example Request**:
  `GET /api/bookings/availability?serviceId=1&bookingDate=2026-10-15`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Service availability retrieved successfully",
    "data": {
      "serviceId": 1,
      "providerId": 5,
      "bookingDate": "2026-10-15",
      "durationMinutes": 60,
      "workingHours": "09:00 - 18:00",
      "slots": [
        {
          "startTime": "09:00",
          "endTime": "10:00",
          "available": true
        },
        {
          "startTime": "10:00",
          "endTime": "11:00",
          "available": false
        },
        {
          "startTime": "11:00",
          "endTime": "12:00",
          "available": true
        }
      ]
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Missing or invalid date format (`YYYY-MM-DD`).
  - `401 Unauthorized`: Missing or invalid JWT.
  - `404 Not Found`: Service does not exist or is inactive.

---

### `POST /bookings`
Create a new booking. Executes within a MySQL ACID transaction with exclusive pessimistic locking (`SELECT ... FOR UPDATE`) to guarantee zero double-booking under concurrency.

- **Auth**: `Bearer <JWT>`
- **Role**: `CUSTOMER` only
- **Body**:
  ```json
  {
    "serviceId": 1,
    "bookingDate": "2026-10-15",
    "startTime": "10:00",
    "endTime": "11:00"
  }
  ```
  *(Note: `endTime` is optional; if omitted, it is automatically derived as `startTime + service.durationMinutes`).*
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Booking created successfully",
    "data": {
      "id": 12,
      "customerId": 3,
      "providerId": 5,
      "serviceId": 1,
      "bookingDate": "2026-10-15",
      "startTime": "2026-10-15T10:00:00.000Z",
      "endTime": "2026-10-15T11:00:00.000Z",
      "totalPrice": 1500,
      "status": "PENDING",
      "createdAt": "2026-10-08T11:00:00.000Z",
      "updatedAt": "2026-10-08T11:00:00.000Z",
      "service": {
        "id": 1,
        "title": "Deluxe Apartment Deep Cleaning",
        "durationMinutes": 60
      },
      "provider": {
        "id": 5,
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "customer": {
        "id": 3,
        "name": "John Smith",
        "email": "john@example.com"
      }
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Appointment slot is in the past, `startTime >= endTime`, or `endTime` duration mismatch.
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Authenticated user is not a `CUSTOMER`.
  - `404 Not Found`: Service not found or inactive.
  - `409 Conflict`: The requested time slot is occupied by an active booking (`"The selected time slot is no longer available."`).

---

### `GET /bookings/customer`
Retrieve bookings created by the authenticated customer.

- **Auth**: `Bearer <JWT>`
- **Role**: `CUSTOMER` only
- **Query Parameters**:
  - `status` *(string, optional)*: Filter by `PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `COMPLETED`.
  - `bookingDate` *(string, optional)*: Filter by `YYYY-MM-DD`.
  - `page` *(number, optional)*: Default `1`.
  - `limit` *(number, optional)*: Default `10`, max `50`.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Customer bookings retrieved successfully",
    "data": {
      "items": [
        {
          "id": 12,
          "customerId": 3,
          "providerId": 5,
          "serviceId": 1,
          "bookingDate": "2026-10-15",
          "startTime": "2026-10-15T10:00:00.000Z",
          "endTime": "2026-10-15T11:00:00.000Z",
          "totalPrice": 1500,
          "status": "PENDING",
          "createdAt": "2026-10-08T11:00:00.000Z",
          "updatedAt": "2026-10-08T11:00:00.000Z",
          "service": {
            "id": 1,
            "title": "Deluxe Apartment Deep Cleaning",
            "durationMinutes": 60
          },
          "provider": {
            "id": 5,
            "name": "Jane Doe",
            "email": "jane@example.com"
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 1,
        "totalPages": 1
      }
    }
  }
  ```

---

### `PATCH /bookings/:id/cancel`
Cancel an active booking by the customer who created it.

- **Auth**: `Bearer <JWT>`
- **Role**: `CUSTOMER` only (must own the booking)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Booking cancelled successfully",
    "data": {
      "booking": {
        "id": 12,
        "customerId": 3,
        "providerId": 5,
        "serviceId": 1,
        "bookingDate": "2026-10-15",
        "startTime": "2026-10-15T10:00:00.000Z",
        "endTime": "2026-10-15T11:00:00.000Z",
        "totalPrice": 1500,
        "status": "CANCELLED",
        "createdAt": "2026-10-08T11:00:00.000Z",
        "updatedAt": "2026-10-08T11:05:00.000Z"
      }
    }
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Authenticated customer does not own this booking.
  - `404 Not Found`: Booking not found.
  - `409 Conflict`: Booking is already `CANCELLED`, `REJECTED`, or `COMPLETED`.

---

### `GET /bookings/provider`
Retrieve bookings scheduled for the authenticated service provider.

- **Auth**: `Bearer <JWT>`
- **Role**: `PROVIDER` only
- **Query Parameters**:
  - `status` *(string, optional)*: Filter by status.
  - `bookingDate` *(string, optional)*: Filter by `YYYY-MM-DD`.
  - `page` *(number, optional)*: Default `1`.
  - `limit` *(number, optional)*: Default `10`, max `50`.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Provider bookings retrieved successfully",
    "data": {
      "items": [
        {
          "id": 12,
          "customerId": 3,
          "providerId": 5,
          "serviceId": 1,
          "bookingDate": "2026-10-15",
          "startTime": "2026-10-15T10:00:00.000Z",
          "endTime": "2026-10-15T11:00:00.000Z",
          "totalPrice": 1500,
          "status": "PENDING",
          "createdAt": "2026-10-08T11:00:00.000Z",
          "updatedAt": "2026-10-08T11:00:00.000Z",
          "service": {
            "id": 1,
            "title": "Deluxe Apartment Deep Cleaning",
            "durationMinutes": 60
          },
          "customer": {
            "id": 3,
            "name": "John Smith",
            "email": "john@example.com"
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 1,
        "totalPages": 1
      }
    }
  }
  ```

---

### `PATCH /bookings/:id/accept`
Accept a pending booking (`PENDING` -> `CONFIRMED`).

- **Auth**: `Bearer <JWT>`
- **Role**: `PROVIDER` only (must own the service / booking)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Booking accepted and confirmed successfully",
    "data": {
      "booking": {
        "id": 12,
        "customerId": 3,
        "providerId": 5,
        "serviceId": 1,
        "bookingDate": "2026-10-15",
        "startTime": "2026-10-15T10:00:00.000Z",
        "endTime": "2026-10-15T11:00:00.000Z",
        "totalPrice": 1500,
        "status": "CONFIRMED",
        "createdAt": "2026-10-08T11:00:00.000Z",
        "updatedAt": "2026-10-08T11:10:00.000Z"
      }
    }
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Authenticated provider does not own this booking.
  - `404 Not Found`: Booking not found.
  - `409 Conflict`: Booking is not in `PENDING` status.

---

### `PATCH /bookings/:id/reject`
Reject a pending booking (`PENDING` -> `REJECTED`). Automatically releases the reserved time slot.

- **Auth**: `Bearer <JWT>`
- **Role**: `PROVIDER` only (must own the service / booking)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Booking rejected successfully",
    "data": {
      "booking": {
        "id": 12,
        "customerId": 3,
        "providerId": 5,
        "serviceId": 1,
        "bookingDate": "2026-10-15",
        "startTime": "2026-10-15T10:00:00.000Z",
        "endTime": "2026-10-15T11:00:00.000Z",
        "totalPrice": 1500,
        "status": "REJECTED",
        "createdAt": "2026-10-08T11:00:00.000Z",
        "updatedAt": "2026-10-08T11:12:00.000Z"
      }
    }
  }
  ```
- **Errors**:
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Authenticated provider does not own this booking.
  - `404 Not Found`: Booking not found.
  - `409 Conflict`: Booking is not in `PENDING` status.

