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
