# 🚀 Tech Yuva Backend — Production API

Production-ready backend API service for **Tech Yuva** — a student-led youth innovation guild platform empowering builders across AI, Web3, Cybersecurity, Systems Architecture, and Startup Culture.

Built with **Node.js, Express, Supabase (PostgreSQL + Auth + Storage + RLS), Zod, and Nodemailer**.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Step-by-Step Supabase Setup Guide](#-step-by-step-supabase-setup-guide)
3. [Environment Configuration](#-environment-configuration)
4. [Running Locally](#-running-locally)
5. [Database Migrations & Seed Data](#-database-migrations--seed-data)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Testing](#-testing)
8. [Deployment Guide (Render / Railway / Vercel)](#-deployment-guide)

---

## 🏛️ Architecture Overview

- **Database & Authentication:** Supabase (PostgreSQL 15) with strict Row Level Security (RLS) policies for `student`, `mentor`, and `admin` roles.
- **File Storage:** Supabase Storage (`event-banners` and `avatars` buckets).
- **Backend API Layer:** Lightweight Node.js/Express service handling privileged business logic:
  - Input validation with **Zod**
  - Navy-themed automated email dispatch (**Nodemailer**)
  - Live impact stats aggregation
  - CSV streaming export for attendees & applicants
  - Security headers (**Helmet**), CORS whitelist, and Rate Limiting
- **Frontend Integration:** Supabase Client (`@supabase/supabase-js`) in the Next.js frontend with fallback to Express API endpoints.

---

## 🛠️ Step-by-Step Supabase Setup Guide

Follow these steps to connect a free Supabase PostgreSQL database:

### Step 1: Create a Supabase Account and Project
1. Go to [https://supabase.com/](https://supabase.com/) and sign in or create a free account.
2. Click **"New Project"**.
3. Fill in the details:
   - **Name:** `Tech-Yuva-Prod` (or your preferred name)
   - **Database Password:** Enter a secure password (store it safely).
   - **Region:** Choose the region closest to your users (e.g. `ap-south-1` Mumbai / Singapore).
   - **Pricing Plan:** Free tier is 100% sufficient.
4. Click **"Create new project"** and wait ~2 minutes for provisioning.

### Step 2: Run Database Migrations in SQL Editor
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar (icon with `>_`).
2. Click **"New Query"**.
3. Open `backend/supabase/migrations/001_initial_schema.sql` in your editor, copy all contents, paste into the Supabase SQL editor, and click **RUN**.
4. Create another query, copy all contents of `backend/supabase/migrations/002_row_level_security.sql`, paste, and click **RUN**.
5. Create another query, copy `backend/supabase/migrations/003_storage_buckets.sql`, paste, and click **RUN**.
6. Create another query, copy `backend/supabase/seed.sql`, paste, and click **RUN**.

### Step 3: Retrieve API Keys
1. In your Supabase Dashboard, navigate to **Project Settings** (gear icon at the bottom left) > **API**.
2. Find the following values:
   - **Project URL:** e.g. `https://xyzproject.supabase.co`
   - **anon / public key:** (Safe for browser / frontend)
   - **service_role key:** (Secret server key that bypasses RLS — **never share publicly or commit to Git!**)

---

## 🔐 Environment Configuration

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your real keys:

```ini
PORT=5000
NODE_ENV=development
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Nodemailer / Email (Optional: works in mock mode if unset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=techyuva.org@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM="Tech Yuva Guild Council <noreply@techyuva.org>"

# App URLs
FRONTEND_URL=http://localhost:3000
DISCORD_INVITE_URL=https://discord.gg/techyuva
```

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation
```bash
cd backend
npm install
```

### Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:8080`.

### Health Check
```bash
curl http://localhost:8080/api/v1/health
```

---

## 📡 API Endpoints Reference

All endpoints are versioned under `/api/v1`:

### 1. Cohorts & Admissions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/cohorts/current` | Public | Returns current cohort and badge status (`● Admission Open · New Cohort 2026`). |
| `GET` | `/api/v1/cohorts` | Public | List all cohorts. |
| `POST` | `/api/v1/cohorts` | Admin | Create a new cohort. |
| `PATCH` | `/api/v1/cohorts/:id/admission` | Admin | Open or close admissions dynamically. |

### 2. Community & Applications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/community/join` | Public | Submit join application with duplicate detection and welcome email. |
| `GET` | `/api/v1/community/me` | User | View own application status. |
| `GET` | `/api/v1/community/members` | Public | Directory of public opt-in builder profiles. |

### 3. Events & Hackathons
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/events` | Public | List upcoming/past events with capacity and mode filters. |
| `GET` | `/api/v1/events/:slug` | Public | Get single event details (e.g. `drophack-26`). |
| `POST` | `/api/v1/events/:id/register` | Public / User | Register for event with ticket confirmation email. |
| `POST` | `/api/v1/events/:id/cancel` | User | Cancel registration. |
| `GET` | `/api/v1/events/:id/attendees` | Staff | View attendees list. |
| `POST` | `/api/v1/events` | Admin | Create a new event. |
| `PATCH` | `/api/v1/events/:id` | Admin | Update event details. |
| `DELETE` | `/api/v1/events/:id` | Admin | Delete event. |

### 4. Dynamic Impact Stats
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/stats` | Public | Live counts: active members, events held, prototypes built, builders impacted. |

### 5. Contact & Newsletter
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/contact` | Public | Submit contact form with admin email alert. |
| `POST` | `/api/v1/contact/newsletter` | Public | Subscribe email to guild newsletter. |

### 6. Admin Portal & Data Exports
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/overview` | Admin | Analytics summary and interest breakdowns. |
| `GET` | `/api/v1/admin/applications` | Admin | List community applications. |
| `PATCH` | `/api/v1/admin/applications/:id` | Admin | Approve or reject candidate application. |
| `GET` | `/api/v1/admin/events/:eventId/attendees/export` | Admin | **Download attendees CSV**. |
| `GET` | `/api/v1/admin/applications/export` | Admin | **Download cohort applications CSV**. |
| `GET` | `/api/v1/admin/users` | Admin | List users and roles. |
| `PATCH` | `/api/v1/admin/users/:id/role` | Admin | Change user role (`student`, `mentor`, `admin`). |

---

## 🧪 Testing

Run the automated integration test suite:

```bash
npm test
```

Tests verify:
- Health check ping
- Live stats computation
- Active cohort badge data
- Events listing and single event query
- Input validation on invalid inputs (Zod schema tests)
- Community application submission and duplicate prevention
- Event registration and email triggers

---

## 🚀 Deployment Guide

### Option 1: Deploy on Render
1. Push your repository to GitHub.
2. Go to [https://render.com/](https://render.com/) and create a **New Web Service**.
3. Connect your GitHub repository.
4. Set configuration:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables from your `.env`:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CORS_ORIGIN=https://your-frontend-domain.com`
6. Click **Deploy Web Service**.

### Option 2: Deploy on Railway
1. Go to [https://railway.app/](https://railway.app/) and create a new project from your GitHub repo.
2. In service settings, set **Root Directory** to `/backend`.
3. Add environment variables. Railway will automatically detect Node.js and run `npm start`.

### Option 3: Deploy on Vercel
1. You can deploy the frontend on Vercel using `npm run build` from the repository root.
2. Set `NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com` in your Vercel project environment variables.
