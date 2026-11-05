# Ace Community Backend

A lean Node.js Express service dedicated solely to:
1. Receiving contact form submissions
2. Storing them in MongoDB (database: `ace`)
3. Immediately returning a success response
4. Asynchronously forwarding the submission to Google Sheets in the background

---

## Architecture & Workflow

```
Frontend (POST /api/contact)
         │
         ▼
[Express Server] ──(1. Store Document)──> [MongoDB Database: "ace"]
         │
         ├───────(2. Immediate 201 Response)──> Frontend (Success)
         │
         ▼
[Background Worker] ──(3. Async Forward)──> [Google Sheets Web App]
         │
         └───────(4. Update Document: "synced")──> [MongoDB Database: "ace"]
```

---

## Directory Structure

```
ace-backend/
├── .env                  # Environment config (Port 5001, Mongo URI, Sheet URL)
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── config/
    │   └── db.js         # MongoDB connection targeting database "ace"
    ├── controllers/
    │   ├── authController.js    # Admin JWT authentication
    │   └── contactController.js # Accepts data, saves to DB & triggers background sync
    ├── middleware/
    │   ├── authMiddleware.js    # JWT bearer authentication middleware
    │   ├── errorHandler.js      # Global error logging & formatting
    │   └── notFound.js          # 404 handler
    ├── models/
    │   ├── Admin.js             # Mongoose model for Admin user
    │   └── ContactSubmission.js # Mongoose model for contact submissions
    ├── routes/
    │   ├── apiRoutes.js         # API root routing
    │   ├── authRoutes.js        # POST /api/auth/login, GET /api/auth/me
    │   └── contactRoutes.js     # POST /api/contact endpoint
    ├── scripts/
    │   └── seedAdmin.js         # Initial admin user seeder
    ├── services/
    │   └── googleSheetService.js # Background Google Sheets Web App dispatcher
    ├── utils/
    │   └── logger.js            # Structured, colorized logger
    ├── app.js                   # Express application setup (CORS, Helmet, JSON/FormData)
    └── server.js                # Server entry point
```

---

## Endpoint Specification

### `POST /api/auth/login`
Admin JWT authentication endpoint. Accepts `application/json`.

#### Payload:
```json
{
  "email": "admin@ace.com",
  "password": "Admin@12345"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "6aec98953de5fe3fd56bcf3a",
    "email": "admin@ace.com",
    "name": "ACE Administrator",
    "role": "admin"
  }
}
```

### `GET /api/auth/me`
Protected admin profile endpoint. Requires `Authorization: Bearer <token>` header.

---

### `POST /api/contact`
Accepts `application/json` or `multipart/form-data` (`FormData`).

#### Payload for Brototype Student (`isBrototypeStudent: "yes"`):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "isBrototypeStudent": "yes",
  "batchNumber": "BCE319",
  "counsellorName": "Jane Smith",
  "message": "I would like to inquire about the program."
}
```

#### Payload for Non-Brototype Student (`isBrototypeStudent: "no"`):
```json
{
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "phone": "9876543210",
  "isBrototypeStudent": "no",
  "message": "I want to know more about ACE community."
}
```

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": {
    "id": "6ace147f0c2ef6d122d8a61b",
    "name": "John Doe",
    "email": "john@example.com",
    "isBrototypeStudent": "yes",
    "createdAt": "2026-10-13T11:22:39.696Z"
  }
}
```

---

### `GET /api/contact`
Protected endpoint for authenticated admin. Lists submitted contact forms with pagination, status filtering, and search.

- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20, max: 100)
  - `status`: Filter by sheet sync status (`pending`, `synced`, `failed`)
  - `isBrototypeStudent`: Filter by student status (`yes`, `no`)
  - `search`: Keyword search over name, email, phone, batchNumber
  - `sort`: Sort expression (default: `-createdAt`)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "6ace147f0c2ef6d122d8a61b",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "isBrototypeStudent": "yes",
      "batchNumber": "BCE319",
      "counsellorName": "Jane Smith",
      "message": "I would like to inquire about the program.",
      "sheetSyncStatus": "synced",
      "sheetSyncedAt": "2026-10-13T11:22:40.120Z",
      "sheetSyncAttempts": 1,
      "createdAt": "2026-10-13T11:22:39.696Z"
    }
  ]
}
```

### `GET /api/contact/:id`
Protected endpoint for authenticated admin. Retrieves a single submission by its MongoDB ID. Requires `Authorization: Bearer <token>`.

---

## Run Locally

```bash
npm run dev
```
Server listens on `http://localhost:5001`.
