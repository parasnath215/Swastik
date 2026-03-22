# Sri Swastik Management System - Backend

This is the backend API for the Sri Swastik Management System (SSMS). Built with Node.js, Express, TypeScript, and Prisma ORM.

## Prerequisites
- Node.js (v18+ recommended)
- npm

## Setup & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
To generate the Prisma client and push your schema to the development database (SQLite by default):
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Database 
To add the default Admin user credentials, run:
```bash
npx ts-node src/seed.ts
```
*(Default testing user is `admin@sriswastik.com` with password `admin123`)*

### 4. Start Development Server
To start the backend with hot-reloading:
```bash
npx nodemon src/index.ts
```
Alternatively, just use `npx ts-node`:
```bash
npx ts-node src/index.ts
```

The server will be ready to accept requests.
