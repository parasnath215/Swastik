# Deployment Guide for Hostinger VPS

This guide outlines the steps to deploy the Shree Swastik project (Next.js Frontend + FastAPI Backend) on a Hostinger VPS running Ubuntu.

## Prerequisites

1.  **Hostinger VPS**: Purchase a VPS plan (Ubuntu 22.04 or 24.04 recommended).
2.  **Domain Name**: Point your domain (e.g., `api.yourdomain.com` for backend, `yourdomain.com` for frontend) to your VPS IP address.
3.  **SSH Access**: You should be able to SSH into your VPS (`ssh root@your_vps_ip`).

## 1. Initial Server Setup

Update your server and install necessary packages.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nodejs npm nginx postgresql postgresql-contrib git -y
```

*Note: You might need to install a newer version of Node.js using `nvm` or NodeSource if the default one is too old.*

## 2. Database Setup (PostgreSQL)

1.  Log in to Postgres:
    ```bash
    sudo -u postgres psql
    ```

2.  Create database and user:
    ```sql
    CREATE DATABASE swastik_db;
    CREATE USER swastik_user WITH PASSWORD 'your_secure_password';
    GRANT ALL PRIVILEGES ON DATABASE swastik_db TO swastik_user;
    \q
    ```

## 3. Backend Deployment (FastAPI)

1.  **Clone the Repository**:
    ```bash
    cd /var/www
    git clone <your-repo-url> swastik
    cd swastik/backend
    ```

2.  **Set up Virtual Environment**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install gunicorn uvicorn
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in `backend/` and set your `DATABASE_URL` to connect to the Postgres DB you created.

4.  **Create Systemd Service**:
    Create `/etc/systemd/system/swastik-backend.service`:
    ```ini
    [Unit]
    Description=Gunicorn instance to serve Swastik API
    After=network.target

    [Service]
    User=root
    Group=www-data
    WorkingDirectory=/var/www/swastik/backend
    Environment="PATH=/var/www/swastik/backend/venv/bin"
    ExecStart=/var/www/swastik/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

    [Install]
    WantedBy=multi-user.target
    ```

5.  **Start the Service**:
    ```bash
    sudo systemctl start swastik-backend
    sudo systemctl enable swastik-backend
    ```

## 4. Frontend Deployment (Next.js)

1.  **Build Deployment**:
    ```bash
    cd /var/www/swastik/frontend
    npm install
    
    # Update API URL in your code or env to point to your backend domain/IP
    # Create .env.production if needed
    
    npm run build
    ```

2.  **Start with PM2** (Process Manager):
    ```bash
    sudo npm install -g pm2
    pm2 start npm --name "swastik-frontend" -- start
    pm2 save
    pm2 startup
    ```

## 5. Nginx Configuration (Reverse Proxy)

Configure Nginx to sit in front of both apps.

Create `/etc/nginx/sites-available/swastik`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com; # Or use IP if testing like: server_name <YOUR_IP>;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com; # Or subfolder logic if using one domain

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/swastik /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. SSL (HTTPS)

Secure your sites using Certbot (Let's Encrypt).

```bash
sudo apt install python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

Your application should now be live and secure!
