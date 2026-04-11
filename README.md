# Courier Tracking SaaS Platform

Multi-tenant courier tracking SaaS: companies manage shipments and lifecycle; customers track packages by tracking ID. Built with Next.js, Express, PostgreSQL (Prisma), and JWT-based RBAC.

---

## Live demo

| Service   | URL |
|-----------|-----|
| **Frontend** | [https://courier-tracking-saas-platform-production-df99.up.railway.app](https://courier-tracking-saas-platform-production-df99.up.railway.app) |
| **Backend API** | [https://courier-tracking-saas-platform-production.up.railway.app](https://courier-tracking-saas-platform-production.up.railway.app) |

Configure the frontend’s `NEXT_PUBLIC_API_URL` in production to your backend origin (no trailing slash). Set the backend’s `CORS_ORIGIN` to your frontend URL.

---

## Tech stack

- **Frontend:** Next.js (React, App Router), TypeScript, Tailwind CSS  
- **Backend:** Node.js, Express  
- **Database:** PostgreSQL (e.g. [Supabase](https://supabase.com) or any hosted Postgres)  
- **ORM:** Prisma  

---

## Setup instructions

### Prerequisites

- Node.js **18+** (20 LTS recommended)  
- PostgreSQL database and connection string  

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Courier-Tracking-Saas-Platform
```

### 2. Backend

```bash
cd backend
npm install
```

Copy environment variables and edit values:

```bash
cp .env.example .env
```

Required in `.env`:

- `DATABASE_URL` — PostgreSQL connection string (SSL if required by host)  
- `JWT_SECRET` — long random string  
- `PORT` — e.g. `5000`  

Optional: `CORS_ORIGIN`, `SMTP_URL` / `MAIL_FROM` (email notifications), Twilio vars (SMS), Cloudinary (if used for uploads).

Apply migrations and generate the Prisma client:

```bash
npx prisma migrate dev
```

Start the API:

```bash
npm run dev
```

The server listens on `http://localhost:<PORT>` (default `5000`). Health check: `GET /health`.

### 3. Frontend

```bash
cd ../frontend
npm install
```

Copy and edit env:

```bash
cp .env.local.example .env.local
```

Set `NEXT_PUBLIC_API_URL` to your API **origin** (no trailing slash), e.g. `http://localhost:5000` for local dev.

Start Next.js:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### First-time platform setup

If the database is empty, use the app’s **setup** flow (or seed scripts if documented in your deployment) to create the initial platform tenant and super admin before using the test credentials below.

---

## Architecture overview

- **Next.js frontend** talks to a **REST Express API** over HTTPS; JSON + `Authorization: Bearer <JWT>`.  
- **PostgreSQL** stores all application data; **Prisma** is the data access layer.  
- **Multi-tenancy:** each courier company is a `Tenant`; tenant-scoped tables carry `tenantId` so data is isolated per company.  
- **Authentication:** JWT issued on login; middleware validates tokens.  
- **Authorization:** role-based access control (RBAC) — `SUPER_ADMIN`, `COMPANY_ADMIN`, `DELIVERY_AGENT`, `CUSTOMER` — enforced on API routes and reflected in the UI.  
- **Public tracking:** unauthenticated `GET /api/track/:trackingId` for shipment lookup by tracking ID.  

---

## Advanced enhancements implemented

1. **Real-time GPS tracking** — Agent location updates and map views (e.g. company live map, event `lat`/`lng`).  
2. **Route optimization** — Hub-to-hub stop ordering and distance helpers via the hubs API.  
3. **AI-based delivery prediction** — History-based estimated delivery (ETA) for hub pairs, exposed via API and used in shipment creation UI.  
4. **QR code generation & scanning** — QR for shipments; agent scanner UI for QR/barcode.  
5. **Mobile-friendly PWA** — Progressive Web App support (service worker / offline fallback where configured).  

*(Pick the subset you highlight in interviews; the brief requires at least two.)*

---

## Test credentials

Use these **only in non-production or dedicated demo environments**. Rotate passwords if they were ever exposed publicly.

| Role | Organization / tenant | Email | Password |
|------|------------------------|-------|----------|
| **Platform Super Admin** | `platform` | `superadmin@platform.com` | `Admin@1234` |
| **Company Admin** | `my-courier` | `admin@mycourier.com` | `Admin@1234` |
| **Delivery Agent** | `my-courier` | `agent@mycourier.com` | `Admin@1234` |

Login requires the correct **organization code** (slug) where applicable, plus email and password.

---

## Shipment status: retry behavior

The spec mentions **Failed / Retry / Returned**. In this codebase, **retry is modeled as allowed state transitions from `FAILED`** (e.g. back into transit or sorting), not as a separate `RETRY` enum value. **`RETURNED`** is its own terminal-style status in the lifecycle.

---

## API documentation

**Published Postman collection:**  
https://yashchalase-5985940.postman.co/workspace/Yash-Chalase's-Workspace~76325f19-dbbe-46f5-8704-ef2f5b995c4c/collection/47002936-91037dd8-8145-48cd-bf9b-ac1e286aeb9c?action=share&creator=47002936

Or import `docs/courier-tracking-api.postman_collection.json` from this repository directly into Postman.

Core route groups (all prefixed by your API origin):

- `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`  
- `POST /api/shipments`, `GET /api/shipments`, `GET /api/shipments/:id`, `POST|PATCH /api/shipments/:id/status`, `POST|PATCH /api/shipments/:id/assign-agent`  
- `GET /api/track/:trackingId` (public)  

---

## Project structure (high level)

```
Courier-Tracking-Saas-Platform/
├── backend/          # Express API, Prisma schema & migrations
├── docs/             # Postman collection (`courier-tracking-api.postman_collection.json`)
├── frontend/         # Next.js app
└── README.md
```

---

## License

Specify your license here (e.g. MIT, private assessment submission).
