# MediBook — Doctor Appointment Booking (MERN Stack)

A full-stack doctor appointment booking web application with three roles: **Patient**, **Doctor**, and **Admin**.

## Features

### Patient
- Register and login
- Search verified doctors by specialization
- View doctor profiles (qualification, experience, fee, availability)
- Book, cancel, and view appointments

### Doctor
- Login after admin verification
- View appointment requests
- Accept/reject appointments
- Assign appointment time
- Mark appointments as completed

### Admin
- Login
- Add, edit, verify, disable, or delete doctors

## Tech Stack

- **MongoDB** — Database
- **Express.js** — REST API
- **React (Vite)** — Frontend
- **Node.js** — Runtime

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string

## Setup

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` if needed (MongoDB URI, JWT secret). The backend also falls back to a local MongoDB instance at `mongodb://127.0.0.1:27017/medibook` if the primary URI is unavailable.

Seed the default admin account:

```bash
npm run seed
```

Start the API server:

```bash
npm run dev
```

Server runs at **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

## Default Admin Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | admin@hospital.com |
| Password | admin123           |

## Quick Start Workflow

1. **Admin** logs in → adds a doctor → verifies the doctor
2. **Doctor** logs in → sees appointment requests on dashboard
3. **Patient** registers → searches doctors → books appointment
4. **Doctor** accepts/rejects → assigns time → marks completed
5. **Patient** views/cancels appointments from "My Appointments"

## API Endpoints

| Method | Endpoint                          | Access        |
|--------|-----------------------------------|---------------|
| POST   | /api/auth/register                | Public        |
| POST   | /api/auth/login                   | Public        |
| GET    | /api/auth/me                      | Authenticated |
| GET    | /api/doctors                      | Public        |
| GET    | /api/doctors/:id                  | Public        |
| POST   | /api/appointments                 | Patient       |
| GET    | /api/appointments                 | All roles     |
| PATCH  | /api/appointments/:id/cancel      | Patient       |
| PATCH  | /api/appointments/:id/accept      | Doctor        |
| PATCH  | /api/appointments/:id/reject      | Doctor        |
| PATCH  | /api/appointments/:id/schedule    | Doctor        |
| PATCH  | /api/appointments/:id/complete    | Doctor        |
| GET    | /api/admin/doctors                | Admin         |
| POST   | /api/admin/doctors                | Admin         |
| PUT    | /api/admin/doctors/:id            | Admin         |
| PATCH  | /api/admin/doctors/:id/verify     | Admin         |
| PATCH  | /api/admin/doctors/:id/disable    | Admin         |
| DELETE | /api/admin/doctors/:id            | Admin         |

## Project Structure

```
Project/
├── backend/
│   ├── config/         # Database connection
│   ├── middleware/     # JWT auth & role guards
│   ├── models/         # User, Doctor, Appointment
│   ├── routes/         # API route handlers
│   ├── utils/          # Seed script
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/ # Navbar, ProtectedRoute
│       ├── context/    # Auth context
│       ├── pages/      # Role-based pages
│       └── services/   # Axios API client
└── README.md
```
