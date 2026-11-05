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
    │   └── contactController.js # Accepts data, saves to DB & triggers background sync
    ├── middleware/
    │   ├── errorHandler.js      # Global error logging & formatting
    │   └── notFound.js          # 404 handler
    ├── models/
    │   └── ContactSubmission.js # Mongoose model for contact submissions
    ├── routes/
    │   ├── apiRoutes.js         # API root routing
    │   └── contactRoutes.js     # POST /api/contact endpoint
    ├── services/
    │   └── googleSheetService.js # Background Google Sheets Web App dispatcher
    ├── utils/
    │   └── logger.js            # Structured, colorized logger
    ├── app.js                   # Express application setup (CORS, Helmet, JSON/FormData)
    └── server.js                # Server entry point
```

---

## Endpoint Specification

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

## Run Locally

```bash
npm run dev
```
Server listens on `http://localhost:5001`.
