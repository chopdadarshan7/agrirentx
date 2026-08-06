# 🌾 AgriRentX — Backend API Design Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:8000`  
> **API Prefix:** `/api`  
> **Swagger UI:** `http://localhost:8000/api-docs`  
> **Environment:** Node.js + Express.js + MongoDB (Mongoose)  
> **Auth:** JWT Bearer Token (Access Token + Refresh Token)  
> **Payment Gateway:** Razorpay  
> **Real-time:** Socket.IO  

---

## 📋 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Authentication](#-authentication)
3. [Security & Middleware](#-security--middleware)
4. [Data Models (Schemas)](#-data-models-schemas)
5. [API Endpoints](#-api-endpoints)
   - [Auth Routes](#1-auth-routes--apiauth)
   - [Equipment Routes](#2-equipment-routes--apiequipments)
   - [Category Routes](#3-category-routes--apicategories)
   - [Booking Routes](#4-booking-routes--apibookings)
   - [Payment Routes](#5-payment-routes--apipayments)
   - [Review Routes](#6-review-routes--apireviews)
   - [Notification Routes](#7-notification-routes--apinotifications)
   - [Availability Routes](#8-availability-routes--apiavailability)
   - [User Routes](#9-user-routes--apiusers)
   - [Farmer Routes](#10-farmer-routes--apifarmer)
   - [Wishlist Routes](#11-wishlist-routes--apiwishlist)
   - [Admin Routes](#12-admin-routes--apiadmin)
   - [Health Routes](#13-health-routes--apihealth)
6. [Error Codes Reference](#-error-codes-reference)
7. [Role & Permission Matrix](#-role--permission-matrix)
8. [Enums Reference](#-enums-reference)
9. [Socket.IO Events](#-real-time-events-socketio)
10. [Environment Variables](#-environment-variables)

---

## 🏗 Architecture Overview

```
agrirentx-backend/
├── server.js               # Entry point — Express app, middleware, routes
├── config/
│   ├── db.js               # MongoDB connection (Mongoose)
│   ├── socket.js           # Socket.IO initialization
│   ├── swagger.js          # Swagger/OpenAPI config
│   ├── razorpay.js         # Razorpay instance
│   └── api.js              # API config
├── models/                 # Mongoose schemas
├── controllers/            # Business logic
├── routes/                 # Express route definitions
├── middleware/             # Auth, error, rate limit, upload
├── validators/             # express-validator rules
├── services/               # Reusable service layer
├── utils/                  # Logger, email, cron, helpers
├── seeders/                # Data seeders
└── docs/                   # Additional docs
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (Access + Refresh Tokens) |
| Payment | Razorpay |
| Real-time | Socket.IO |
| File Upload | Multer |
| Email | Nodemailer (SMTP / Gmail) |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Winston (custom logger) |
| Compression | compression (gzip) |

---

## 🔐 Authentication

AgriRentX uses **JWT Bearer Token** authentication.

### Token Flow

```
POST /api/auth/register → returns { accessToken, refreshToken }
POST /api/auth/login    → returns { accessToken, refreshToken }
POST /api/auth/refresh-token → returns new { accessToken }
POST /api/auth/logout   → clears refresh token
```

### Authorization Header

```http
Authorization: Bearer <accessToken>
```

### User Roles

| Role | Description |
|------|-------------|
| `farmer` | Default role. Can book equipment, write reviews |
| `rentaler` | Can list equipment, approve/reject/complete bookings |
| `admin` | Full platform access, moderation, analytics |

> A user can be both a farmer AND a rentaler simultaneously.  
> `rentaler_status` must be `"approved"` before rentaler features are accessible.

---

## 🛡 Security & Middleware

| Middleware | Purpose |
|-----------|---------|
| `helmet` | Sets secure HTTP headers |
| `cors` | Restricts origins (default: http://localhost:5173) |
| `apiLimiter` | Rate limits all /api/* routes |
| `authLimiter` | Stricter rate limit on auth routes |
| `protect` | Validates JWT, attaches user to req.user |
| `isAdmin` | Checks req.user.isAdmin === true |
| `isApprovedRentaler` | Checks rentaler_status === "approved" |
| `requestLogger` | Logs every HTTP request |
| `requestId` | Attaches unique request ID |
| `errorHandler` | Global error response handler |
| `notFound` | 404 handler for unmatched routes |
| `upload` | Multer file upload (images to /uploads/equipments/) |

---

## 📦 Data Models (Schemas)

### User Model

```js
{
  fullName:        String (required)
  email:           String (required, unique, lowercase)
  phone:           String (required, unique)
  password:        String (required, min 6, bcrypt hashed)
  avatar:          String (default: "")
  address:         String
  city:            String
  state:           String
  pincode:         String
  is_farmer:       Boolean (default: true)
  is_rentaler:     Boolean (default: false)
  rentaler_status: Enum ["none","pending","approved","rejected"]
  kyc_documents: {
    id_proof:      String
    address_proof: String
  }
  bank_details: {
    account_holder: String
    account_number: String
    ifsc_code:      String
    bank_name:      String
  }
  isAdmin:         Boolean (default: false)
  isBlocked:       Boolean (default: false)
  refreshToken:    String
  lastLogin:       Date
  isDeleted:       Boolean (default: false)
  deletedAt:       Date
  // Virtual: role → "admin" | "rentaler" | "farmer"
  createdAt, updatedAt (timestamps)
}
```

---

### Equipment Model

```js
{
  rentaler_id:      ObjectId → User (required)
  category_id:      ObjectId → Category (required)
  title:            String (required, text-indexed)
  description:      String (required, text-indexed)
  specifications:   Map<String, Mixed>
  price_per_day:    Number (required, min: 0)
  security_deposit: Number (default: 0)
  location: {
    address:   String (required)
    village:   String
    taluka:    String
    district:  String
    state:     String
    pincode:   String
    latitude:  Number (required)
    longitude: Number (required)
    geo: {
      type: "Point"
      coordinates: [longitude, latitude]   // auto-synced via pre-save hook
    }
  }
  images:                [String] (URLs)
  ownership_document_url: String
  status:          Enum ["available","rented","maintenance","inactive"]
  approval_status: Enum ["pending","approved","rejected"]
  average_rating:  Number (0-5)
  total_reviews:   Number
  is_deleted:      Boolean (default: false)
  // Indexes: text(title,description), 2dsphere(location.geo)
  createdAt, updatedAt (timestamps)
}
```

---

### Booking Model

```js
{
  farmer_id:           ObjectId → User (required)
  rentaler_id:         ObjectId → User (required)
  equipment_id:        ObjectId → Equipment (required)
  start_date:          Date (required)
  end_date:            Date (required)
  total_days:          Number (required, min: 1)
  base_amount:         Number (required, min: 0)
  deposit_amount:      Number (default: 0)
  platform_fee:        Number (default: 0)
  total_amount:        Number (required, min: 0)
  booking_status:      Enum ["pending_payment","confirmed","active","completed","cancelled","rejected"]
  payment_status:      Enum ["pending","paid","refunded","failed"]
  cancellation_reason: String
  cancelled_at:        Date
  completed_at:        Date
  createdAt, updatedAt (timestamps)
}
```

---

### Payment Model

```js
{
  booking_id:           ObjectId → Booking (required)
  razorpay_order_id:    String (required, unique)
  razorpay_payment_id:  String
  razorpay_signature:   String
  amount:               Number (required, in paise for INR)
  currency:             String (default: "INR")
  payment_method:       String
  payment_status:       Enum ["pending","paid","failed","refunded"]
  refund_id:            String
  refund_status:        Enum ["none","pending","processed","failed"]
  commission_amount:    Number (platform cut)
  payout_amount:        Number (to rentaler)
  payout_status:        Enum ["pending","processing","completed"]
  paid_at:              Date
  refunded_at:          Date
  createdAt, updatedAt (timestamps)
}
```

---

### Review Model

```js
{
  booking_id:   ObjectId → Booking (required, unique — 1 review per booking)
  equipment_id: ObjectId → Equipment (required)
  farmer_id:    ObjectId → User (required)
  rentaler_id:  ObjectId → User (required)
  rating:       Number (required, 1-5)
  review:       String (max 1000 chars)
  isVisible:    Boolean (default: true)
  createdAt, updatedAt (timestamps)
}
```

---

### Notification Model

```js
{
  user_id:  ObjectId → User
  title:    String
  message:  String
  type:     String (e.g. "booking", "payment", "system")
  isRead:   Boolean (default: false)
  createdAt, updatedAt (timestamps)
}
```

---

### Category Model

```js
{
  name:        String (required, unique)
  description: String
  image:       String (URL)
  isActive:    Boolean (default: true)
  createdAt, updatedAt (timestamps)
}
```

---

### Wishlist Model

```js
{
  farmer_id:    ObjectId → User
  equipment_id: ObjectId → Equipment
  createdAt, updatedAt (timestamps)
}
```

---

### Availability Model

```js
{
  equipment_id: ObjectId → Equipment
  start_date:   Date
  end_date:     Date
  is_blocked:   Boolean (default: false)
  note:         String
  createdAt, updatedAt (timestamps)
}
```

---

## 📡 API Endpoints

---

### 1. Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/auth/register | Public | — | Register new user |
| POST | /api/auth/login | Public | — | Login, returns tokens |
| POST | /api/auth/refresh-token | Public | — | Refresh access token |
| POST | /api/auth/refresh | Public | — | Alias for refresh-token |
| POST | /api/auth/logout | Protected | Any | Logout |
| GET | /api/auth/me | Protected | Any | Get current logged-in user |
| PUT | /api/auth/upgrade-rentaler | Protected | Farmer | Request upgrade to rentaler |

#### POST /api/auth/register

Request Body:
```json
{
  "fullName": "Tejas Patil",
  "email": "tejas@example.com",
  "phone": "9876543210",
  "password": "securepassword"
}
```

Response 201:
```json
{
  "success": true,
  "message": "User Registered Successfully",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": { "_id": "...", "fullName": "Tejas Patil", "role": "farmer" }
  }
}
```

#### POST /api/auth/login

Request Body:
```json
{
  "email": "tejas@example.com",
  "password": "securepassword"
}
```

Response 200:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": { "_id": "...", "fullName": "Tejas Patil", "role": "farmer" }
  }
}
```

---

### 2. Equipment Routes — `/api/equipments`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /api/equipments | Public | — | Get all equipments (filters, pagination) |
| GET | /api/equipments/nearby | Public | — | Nearby equipment by geo |
| GET | /api/equipments/pending | Protected | Admin | Get pending equipments |
| GET | /api/equipments/:id | Public | — | Get equipment by ID |
| POST | /api/equipments | Protected | Approved Rentaler | Create equipment listing |
| PUT | /api/equipments/:id | Protected | Approved Rentaler | Update equipment |
| DELETE | /api/equipments/:id | Protected | Approved Rentaler | Delete equipment |
| PUT | /api/equipments/:id/approve | Protected | Admin | Approve listing |
| PATCH | /api/equipments/:id/approve | Protected | Admin | Approve (alias) |
| PUT | /api/equipments/:id/reject | Protected | Admin | Reject listing |
| PATCH | /api/equipments/:id/reject | Protected | Admin | Reject (alias) |

#### GET /api/equipments — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| search | string | Full-text search (title, description) |
| category | string | Filter by category ID |
| district | string | Filter by district |
| state | string | Filter by state |
| minPrice | number | Minimum price per day |
| maxPrice | number | Maximum price per day |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 10) |

#### GET /api/equipments/nearby — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| latitude | number | User latitude |
| longitude | number | User longitude |
| radius | number | Search radius in km (default: 50) |

#### POST /api/equipments — multipart/form-data

```
title              string (required)
description        string (required)
category_id        string ObjectId (required)
price_per_day      number (required)
security_deposit   number
location[address]  string (required)
location[village]  string
location[district] string
location[state]    string
location[pincode]  string
location[latitude] number (required)
location[longitude] number (required)
images             file[] (max 10 images)
specifications     JSON string
```

---

### 3. Category Routes — `/api/categories`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /api/categories | Public | — | Get all categories |
| GET | /api/categories/:id | Public | — | Get category by ID |
| POST | /api/categories | Protected | Admin | Create category |
| PUT | /api/categories/:id | Protected | Admin | Update category |
| DELETE | /api/categories/:id | Protected | Admin | Delete category |

#### POST /api/categories

```json
{
  "name": "Tractors",
  "description": "Agricultural tractors for ploughing",
  "image": "https://..."
}
```

---

### 4. Booking Routes — `/api/bookings`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/bookings | Protected | Farmer | Create booking |
| GET | /api/bookings/my-bookings | Protected | Farmer | Get my bookings |
| GET | /api/bookings/rentaler-bookings | Protected | Approved Rentaler | Get rentaler received bookings |
| GET | /api/bookings/:id | Protected | Any | Get booking by ID |
| PUT | /api/bookings/:id/approve | Protected | Approved Rentaler | Approve booking |
| PATCH | /api/bookings/:id/approve | Protected | Approved Rentaler | Approve (alias) |
| PUT | /api/bookings/:id/reject | Protected | Approved Rentaler | Reject booking |
| PATCH | /api/bookings/:id/reject | Protected | Approved Rentaler | Reject (alias) |
| PUT | /api/bookings/:id/cancel | Protected | Any | Cancel booking |
| PATCH | /api/bookings/:id/cancel | Protected | Any | Cancel (alias) |
| PUT | /api/bookings/:id/complete | Protected | Approved Rentaler | Mark complete |
| PATCH | /api/bookings/:id/complete | Protected | Approved Rentaler | Complete (alias) |

#### POST /api/bookings

```json
{
  "equipment_id": "64abc123...",
  "start_date": "2026-08-10",
  "end_date": "2026-08-15"
}
```

Response 201:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "total_days": 5,
    "base_amount": 7500,
    "deposit_amount": 2000,
    "platform_fee": 375,
    "total_amount": 9875,
    "booking_status": "pending_payment",
    "payment_status": "pending"
  }
}
```

#### Booking Status Flow

```
pending_payment → [payment done] → confirmed
confirmed → [rentaler approves] → active
confirmed → [rentaler rejects]  → rejected
active    → [rentaler completes] → completed
confirmed | active → [cancel] → cancelled
```

---

### 5. Payment Routes — `/api/payments`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/payments/create-order | Protected | Farmer | Create Razorpay order |
| POST | /api/payments/verify | Protected | Farmer | Verify payment signature |
| GET | /api/payments/history | Protected | Any | Payment history |
| GET | /api/payments/statistics | Protected | Any | Payment statistics |
| GET | /api/payments/dashboard | Protected | Admin | Admin payment dashboard |
| GET | /api/payments/failed | Protected | Any | Failed payments |
| POST | /api/payments/retry/:id | Protected | Farmer | Retry failed payment |
| GET | /api/payments | Protected | Admin | All payments |
| GET | /api/payments/rentaler | Protected | Rentaler | Rentaler payment history |
| GET | /api/payments/rentaler/stats | Protected | Rentaler | Rentaler payment stats |
| GET | /api/payments/:id | Protected | Any | Get payment by ID |
| POST | /api/payments/refund/:id | Protected | Admin | Refund payment |
| POST | /api/payments/webhook | Public | — | Razorpay webhook handler |

#### Razorpay Payment Flow

```
1. POST /api/payments/create-order  → { razorpay_order_id, amount, currency }
2. Frontend opens Razorpay Checkout modal with order_id
3. User pays on Razorpay UI
4. POST /api/payments/verify → { razorpay_order_id, razorpay_payment_id, razorpay_signature }
5. Backend verifies HMAC-SHA256 → marks booking "confirmed"
```

#### POST /api/payments/create-order

```json
{ "booking_id": "64abc123..." }
```

Response 201:
```json
{
  "success": true,
  "data": {
    "razorpay_order_id": "order_xxxxx",
    "amount": 987500,
    "currency": "INR"
  }
}
```

#### POST /api/payments/verify

```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "hmac_sha256_signature"
}
```

---

### 6. Review Routes — `/api/reviews`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/reviews | Protected | Farmer | Create review |
| GET | /api/reviews/top-equipments | Public | — | Top rated equipments |
| GET | /api/reviews/top-rentalers | Public | — | Top rated rentalers |
| GET | /api/reviews/equipment/:equipmentId | Public | — | Reviews for equipment |
| GET | /api/reviews/rentaler/me | Protected | Rentaler | My reviews as rentaler |
| GET | /api/reviews/rentaler/:rentalerId | Public | — | Reviews for rentaler |
| GET | /api/reviews/statistics | Protected | Any | Review statistics |
| GET | /api/reviews/:id | Public | — | Get review by ID |
| PUT | /api/reviews/:id | Protected | Farmer | Update own review |
| DELETE | /api/reviews/:id | Protected | Farmer | Delete own review |

#### POST /api/reviews

```json
{
  "booking_id": "64abc123...",
  "equipment_id": "64def456...",
  "rating": 5,
  "review": "Excellent tractor, runs perfectly!"
}
```

> Note: Only one review is allowed per booking (unique constraint on booking_id).

---

### 7. Notification Routes — `/api/notifications`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/notifications | Protected | Any | Create notification |
| GET | /api/notifications | Protected | Any | Get my notifications |
| GET | /api/notifications/statistics | Protected | Any | Notification stats |
| PATCH | /api/notifications/read-all | Protected | Any | Mark all as read |
| PUT | /api/notifications/read-all | Protected | Any | Mark all as read (alias) |
| PATCH | /api/notifications/:id/read | Protected | Any | Mark single as read |
| PUT | /api/notifications/:id/read | Protected | Any | Mark as read (alias) |
| DELETE | /api/notifications/:id | Protected | Any | Delete notification |

---

### 8. Availability Routes — `/api/availability`

All routes require JWT authentication.

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/availability | Protected | Rentaler | Create availability/blocked slot |
| GET | /api/availability/:equipmentId | Protected | Any | Get equipment availability |
| PUT | /api/availability/:availabilityId | Protected | Rentaler | Update availability slot |
| DELETE | /api/availability/:availabilityId | Protected | Rentaler | Delete availability slot |

#### POST /api/availability

```json
{
  "equipment_id": "64abc123...",
  "start_date": "2026-08-20",
  "end_date": "2026-08-25",
  "is_blocked": true,
  "note": "Under maintenance"
}
```

---

### 9. User Routes — `/api/users`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /api/users | Protected | Any | Get user profile |
| PUT | /api/users | Protected | Any | Update user profile |
| DELETE | /api/users | Protected | Any | Delete own account |

---

### 10. Farmer Routes — `/api/farmer`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /api/farmer/dashboard | Protected | Farmer | Farmer dashboard data |

---

### 11. Wishlist Routes — `/api/wishlist`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/wishlist/:equipmentId | Protected | Farmer | Add to wishlist |
| DELETE | /api/wishlist/:equipmentId | Protected | Farmer | Remove from wishlist |
| GET | /api/wishlist | Protected | Farmer | Get my wishlist |

---

### 12. Admin Routes — `/api/admin`

All admin routes require: `Authorization: Bearer <token>` where the user has `isAdmin: true`.

#### 12.1 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Admin dashboard statistics |

#### 12.2 User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | Get all users |
| GET | /api/admin/users/:id | Get user by ID |
| PUT | /api/admin/users/:id/status | Update user account_status |
| PUT | /api/admin/users/:id/block | Block / Unblock user (toggle) |
| PUT | /api/admin/users/:id/unblock | Explicitly unblock user |
| DELETE | /api/admin/users/:id | Soft-delete user |

#### 12.3 Rentaler Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/rentalers/pending | Pending rentaler applications |
| GET | /api/admin/rentalers/approved | Approved rentalers |
| PUT | /api/admin/rentalers/:id/approve | Approve rentaler |
| PUT | /api/admin/rentalers/:id/reject | Reject rentaler |
| PUT | /api/admin/rentalers/:id/suspend | Suspend rentaler |
| PUT | /api/admin/rentalers/:id/reactivate | Reactivate rentaler |
| PUT | /api/admin/users/:id/approve-rentaler | Approve rentaler (alt path) |
| PUT | /api/admin/users/:id/reject-rentaler | Reject rentaler (alt path) |
| PUT | /api/admin/kyc/:id | Approve / Reject KYC |

#### 12.4 Equipment Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/equipments | All equipments |
| GET | /api/admin/equipments/pending | Pending equipment listings |
| GET | /api/admin/equipments/approved | Approved equipment listings |
| PUT | /api/admin/equipments/:id/approve | Approve equipment |
| PUT | /api/admin/equipments/:id/reject | Reject equipment |

#### 12.5 Booking Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/bookings | All bookings |
| GET | /api/admin/bookings/:id | Booking by ID |
| PUT | /api/admin/bookings/:id/status | Update booking status |
| PUT | /api/admin/bookings/:id/cancel | Cancel booking |
| DELETE | /api/admin/bookings/:id | Delete booking |

#### 12.6 Payment Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/payments | All payments |
| GET | /api/admin/payments/statistics | Payment statistics |
| GET | /api/admin/payments/:id | Payment by ID |
| PUT | /api/admin/payments/:id/status | Update payment status |
| PUT | /api/admin/payments/:id/refund | Process refund |

#### 12.7 Review Moderation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/reviews | All reviews |
| GET | /api/admin/reviews/:id | Review by ID |
| PUT | /api/admin/reviews/:id/hide | Hide review |
| PUT | /api/admin/reviews/:id/restore | Restore hidden review |
| DELETE | /api/admin/reviews/:id | Permanently delete review |

#### 12.8 Notification Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/notifications/broadcast | Broadcast to all users |
| GET | /api/admin/notifications | All notifications |
| GET | /api/admin/notifications/statistics | Notification statistics |
| GET | /api/admin/notifications/:id | Notification by ID |
| PUT | /api/admin/notifications/:id/read | Mark as read |
| DELETE | /api/admin/notifications/:id | Delete notification |

#### 12.9 Analytics & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/analytics/revenue | Revenue analytics |
| GET | /api/admin/analytics/bookings | Booking analytics |
| GET | /api/admin/analytics/users | User growth analytics |
| GET | /api/admin/analytics/equipments | Equipment analytics |
| GET | /api/admin/analytics/dashboard | Full analytics dashboard |
| GET | /api/admin/reports?from=&to= | Generate reports (optional date range) |

Reports Query Params:

| Param | Type | Description |
|-------|------|-------------|
| from | date ISO 8601 | Start date e.g. 2026-01-01 |
| to | date ISO 8601 | End date e.g. 2026-12-31 |

---

### 13. Health Routes — `/api/health`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | Public | Server health check |

Response 200:
```json
{
  "status": "ok",
  "uptime": 12345.67,
  "timestamp": "2026-08-03T10:00:00.000Z"
}
```

---

## ❌ Error Codes Reference

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human readable error message",
  "errors": []
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 200 | OK — Success |
| 201 | Created — Resource created |
| 400 | Bad Request — Validation failed |
| 401 | Unauthorized — Invalid / missing token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource doesn't exist |
| 409 | Conflict — Duplicate resource |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests — Rate limit exceeded |
| 500 | Internal Server Error |

---

## 🔑 Role & Permission Matrix

| Feature | Farmer | Rentaler (approved) | Admin |
|---------|:------:|:-------------------:|:-----:|
| Register / Login | ✅ | ✅ | ✅ |
| Browse Equipments | ✅ | ✅ | ✅ |
| Create Booking | ✅ | ✅ | ❌ |
| Cancel Booking | ✅ | ✅ | ✅ |
| Create Payment | ✅ | ✅ | ❌ |
| Write Review | ✅ | ❌ | ❌ |
| Add to Wishlist | ✅ | ✅ | ❌ |
| List Equipment | ❌ | ✅ | ❌ |
| Approve/Reject Booking | ❌ | ✅ | ✅ |
| Complete Booking | ❌ | ✅ | ❌ |
| View Own Payments | ✅ | ✅ | ✅ |
| Manage Availability | ❌ | ✅ | ❌ |
| Approve Equipment | ❌ | ❌ | ✅ |
| Approve Rentaler | ❌ | ❌ | ✅ |
| View All Users | ❌ | ❌ | ✅ |
| Block/Unblock User | ❌ | ❌ | ✅ |
| Process Refund | ❌ | ❌ | ✅ |
| Broadcast Notification | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ❌ | ✅ |
| Hide/Restore Review | ❌ | ❌ | ✅ |
| Generate Reports | ❌ | ❌ | ✅ |

---

## 📚 Enums Reference

### User

| Field | Values |
|-------|--------|
| rentaler_status | none | pending | approved | rejected |
| role (virtual) | farmer | rentaler | admin |

### Equipment

| Field | Values |
|-------|--------|
| status | available | rented | maintenance | inactive |
| approval_status | pending | approved | rejected |

### Booking

| Field | Values |
|-------|--------|
| booking_status | pending_payment | confirmed | active | completed | cancelled | rejected |
| payment_status | pending | paid | refunded | failed |

### Payment

| Field | Values |
|-------|--------|
| payment_status | pending | paid | failed | refunded |
| refund_status | none | pending | processed | failed |
| payout_status | pending | processing | completed |

---

## 🔌 Real-time Events (Socket.IO)

Socket.IO is initialized on the same HTTP server at ws://localhost:8000.

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| connection | Client → Server | — | User connects |
| disconnect | Client → Server | — | User disconnects |
| booking:created | Server → Client | { booking } | New booking created |
| booking:approved | Server → Client | { booking } | Booking approved |
| booking:rejected | Server → Client | { booking } | Booking rejected |
| booking:cancelled | Server → Client | { booking } | Booking cancelled |
| payment:verified | Server → Client | { payment } | Payment verified |
| notification:new | Server → Client | { notification } | New notification |

---

## 🌐 Static Assets

| Path | Description |
|------|-------------|
| /uploads/equipments/* | Equipment images (served statically) |
| /api-docs | Swagger UI documentation |
| /api/docs | Swagger UI (alias) |

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | Yes | Server port (default: 8000) |
| MONGO_URI | Yes | MongoDB Atlas connection string |
| JWT_SECRET | Yes | Access token signing secret |
| JWT_REFRESH_SECRET | Yes | Refresh token signing secret |
| NODE_ENV | Yes | development or production |
| RAZORPAY_KEY_ID | Yes | Razorpay Key ID |
| RAZORPAY_KEY_SECRET | Yes | Razorpay Key Secret |
| RAZORPAY_WEBHOOK_SECRET | Yes | Razorpay webhook signing secret |
| CURRENCY | Yes | Currency code (e.g. INR) |
| SMTP_HOST | Yes | Email SMTP host |
| SMTP_PORT | Yes | Email SMTP port |
| SMTP_USER | Yes | Email sender address |
| SMTP_PASS | Yes | Email app password |
| SMTP_FROM | Yes | Email from display name + address |
| CLIENT_URL | No | Frontend CORS URL (default: http://localhost:5173) |

---

*Generated by Antigravity — AgriRentX Backend API Design Documentation v1.0.0*
