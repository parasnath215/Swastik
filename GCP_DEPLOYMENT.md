# Google Cloud Run Deployment Guide

This guide describes how to deploy the Shree Swastik application to Google Cloud Run.

## Prerequisites

1.  **Google Cloud Platform Account**: Ensure you have a GCP project created.
2.  **gcloud CLI**: Install and authenticate (`gcloud auth login`).
3.  **Docker**: Installed and running locally (if you want to build locally).

## 1. Enable Services

Enable the necessary APIs:
```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
```

## 2. Infrastructure Setup (Database)

Cloud Run is stateless. You need a managed database.
1.  **Cloud SQL**: Create a PostgreSQL instance in Google Cloud SQL.
2.  Create a database `swastik_db` and a user.
3.  Note the **Connection Name** (e.g., `project-id:region:instance`).

## 3. Deploy Backend

1.  **Navigate to backend**:
    ```bash
    cd backend
    ```

2.  **Submit Build**:
    ```bash
    gcloud builds submit --tag gcr.io/PROJECT_ID/swastik-backend
    ```
    *(Replace `PROJECT_ID` with your actual project ID)*

3.  **Deploy**:
    ```bash
    gcloud run deploy swastik-backend \
        --image gcr.io/PROJECT_ID/swastik-backend \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --set-env-vars DATABASE_URL="postgresql://user:pass@/swastik_db?host=/cloudsql/INSTANCE_CONNECTION_NAME" \
        --add-cloudsql-instances INSTANCE_CONNECTION_NAME
    ```

## 4. Deploy Frontend

1.  **Navigate to frontend**:
    ```bash
    cd ../frontend
    ```

2.  **Submit Build**:
    ```bash
    gcloud builds submit --tag gcr.io/PROJECT_ID/swastik-frontend
    ```

3.  **Deploy**:
    ```bash
    gcloud run deploy swastik-frontend \
        --image gcr.io/PROJECT_ID/swastik-frontend \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated
    ```

4.  **Update Environment Variables**:
    The frontend needs to know the backend URL.
    - Go to the Cloud Run console for `swastik-frontend`.
    - Edit and Deploy New Revision.
    - Add Environment Variable:
        - `NEXT_PUBLIC_API_URL`: `https://swastik-backend-xyz-uc.a.run.app/api/v1` (Use the actual URL of your deployed backend)

## 5. Summary

- **Backend**: Deployed as a Python container listening on `$PORT`.
- **Frontend**: Deployed as a Next.js container listening on `$PORT`.
- **Database**: Cloud SQL (PostgreSQL) connected via Unix socket.
