# Render Deployment Guide

Follow these simple steps to deploy **Sri Swastik** globally using your new optimized setup!

## 1. Push to GitHub
Commit all the new changes to your repository and push them to GitHub. The critical changes deployed:
- `backend/package.json` (Added build/start commands)
- `frontend/src/lib/api.ts` (Dynamic production API URL handling)
- `render.yaml` (The Infrastructure Blueprint)

## 2. Deploy via Blueprint
Render's Blueprints feature allows you to automatically create and network all your services from one file.
1. Create a free account at [render.com](https://render.com).
2. Click **New** button in the dashboard, and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file. Click **Apply**.
5. Render will automatically provision:
   - A PostgreSQL Database (`swastik-db`)
   - A Node HTTP Web Service (`swastik-backend`)
   - A Static React Site (`swastik-frontend`)

*(Note: The very first deployment might take a few minutes as it provisions the database and runs the Prisma migrations).*

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

Your application is now successfully hosted on Render and accessible anywhere!
