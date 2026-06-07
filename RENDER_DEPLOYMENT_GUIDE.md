# Render Deployment Guide

Follow these simple steps to deploy **Sri Swastik** globally using your Render Blueprint setup!

---

## ⚠️ IMPORTANT: Prisma Database Provider Setup

Because Prisma requires a static database provider in `schema.prisma`, you have two choices for managing local development vs. production:

### Option A: Manual Switching (Easiest if not using Docker locally)
1. **Locally (Development):** Keep `provider = "sqlite"` in `backend/prisma/schema.prisma` and `DATABASE_URL="file:./dev.db"` in `backend/.env`.
2. **Before Pushing to GitHub (Production):** 
   - Open `backend/prisma/schema.prisma` and change `provider = "sqlite"` to `provider = "postgresql"`.
   - Run `npx prisma generate` to rebuild the client configuration.
   - Commit and push to GitHub.

### Option B: Local PostgreSQL (Recommended to avoid code changes)
1. Keep `provider = "postgresql"` in `backend/prisma/schema.prisma` and `DATABASE_URL="postgresql://admin:password123@localhost:5432/ssms?schema=public"` in `backend/.env`.
2. Install/Open Docker Desktop on your machine.
3. Start the local database container by running in the project root:
   ```bash
   docker-compose up -d
   ```

---

## 1. Push to GitHub
Commit all your changes and push them to your GitHub repository (using `git_setup.ps1` or git command line):
```bash
git add .
git commit -m "Configure project for Render auto-deployment"
git push origin main
```

---

## 2. Deploy via Render Blueprint
We have updated `render.yaml` to automatically provision a free PostgreSQL database, link it to your Node.js backend, and connect the frontend to the backend.

1. Go to [render.com](https://render.com) and log in.
2. Click the **New +** button in the dashboard, and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically read `render.yaml` and prompt you to create:
   - **`swastik-db`** (PostgreSQL Database)
   - **`swastik-backend`** (Node/Express API)
   - **`swastik-frontend`** (React Static Site)
5. Click **Apply**. Render will automatically provision and deploy everything. 
*(Note: The first deployment runs database push migrations and seeds automatically).*

---

## 3. 🚨 CRITICAL FIX: React Router Single Page App (SPA) Rewrites 🚨

Because your frontend is a React application managing its own routes (like `/scheduler` or `/projects`), a straight static server will throw a `404 Not Found` error if you refresh the page anywhere except the homepage.

You must add a Rewrite rule on Render so it routes all traffic to `index.html`.

1. Go to your Render Dashboard.
2. Click on your newly created frontend service: **`swastik-frontend`**
3. On the left side navigation, click **Redirects/Rewrites**.
4. Create a new rule exactly like this:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
5. Click **Save Changes**.

Your application is now successfully hosted on Render!

