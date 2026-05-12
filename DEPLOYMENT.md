# Deployment Guide: The Nigerian History Pulse

This guide covers deploying the **backend** to AWS EC2 (via Docker) and the **frontend** to Vercel.

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────────────────────┐
│                 │  HTTPS  │          AWS EC2                 │
│  Vercel (CDN)   │ ──────► │  ┌───────┐     ┌────────────┐  │
│  React Frontend │         │  │ Nginx │────►│  FastAPI    │  │
│                 │         │  │  :80  │     │  (Docker)   │  │
└─────────────────┘         │  └───────┘     └──────┬─────┘  │
                            │                       │         │
                            │               ┌───────▼───────┐ │
                            │               │  SQLite DB    │ │
                            │               │ (Docker Vol.) │ │
                            │               └───────────────┘ │
                            └─────────────────────────────────┘
```

---

## 1. Backend — AWS EC2 Setup

### 1.1 Launch an EC2 Instance

1. Go to the [AWS EC2 Console](https://console.aws.amazon.com/ec2)
2. Click **Launch Instance**
3. Choose these settings:
   - **Name**: `area1914-backend`
   - **AMI**: Amazon Linux 2023 or Ubuntu 24.04 LTS
   - **Instance type**: `t2.micro` (free tier) or `t3.micro`
   - **Key pair**: Create or select an SSH key pair
   - **Security group**: Allow the following inbound rules:
     - **SSH** (port 22) — your IP only
     - **HTTP** (port 80) — anywhere (0.0.0.0/0)
     - **HTTPS** (port 443) — anywhere (for future SSL)
4. Launch the instance and note the **Public IPv4 address**

### 1.2 Connect & Install Docker

```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# --- For Amazon Linux 2023 ---
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Log out and back in for group changes to take effect
exit
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Verify
docker --version
docker compose version
```

### 1.3 Clone & Configure

```bash
# Clone the repo
git clone https://github.com/JosephAyo/area-1914.git
cd area-1914

# Create the backend .env file
cat > backend/.env << 'EOF'
PROJECT_NAME="The Nigerian History Pulse"
DATABASE_URL="sqlite:////app/data/area1914.db"
WIKIMEDIA_USER_AGENT="NigerianHistoryPulse/1.0 (your_actual_email@example.com)"
ALLOWED_ORIGINS="http://YOUR_VERCEL_DOMAIN,https://YOUR_VERCEL_DOMAIN"
EOF
```

> **Important**: Replace `YOUR_VERCEL_DOMAIN` with your actual Vercel URL after deploying the frontend (e.g., `https://nigerian-history-pulse.vercel.app`). You can update this later and restart the containers.

### 1.4 Build & Run

```bash
# Build and start all services in detached mode
docker compose up -d --build

# Verify everything is running
docker compose ps

# Check the logs
docker compose logs -f

# Test the API
curl http://localhost/health
# Should return: {"status":"ok"}

curl http://localhost/api/docs
# Should return the FastAPI Swagger docs HTML
```

### 1.5 Useful Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f nginx

# Restart services
docker compose restart

# Rebuild after code changes
git pull
docker compose up -d --build

# Stop everything
docker compose down

# Stop and remove volumes (⚠️ DELETES DATABASE)
docker compose down -v
```

---

## 2. Frontend — Vercel Setup

### 2.1 Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `area-1914` repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### 2.2 Set Environment Variables

In the Vercel project settings → **Environment Variables**, add:

| Variable | Value | Environment |
|---|---|---|
| `VITE_API_BASE_URL` | `http://YOUR_EC2_PUBLIC_IP/api` | Production |

> **Note**: Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP address (e.g., `http://54.123.45.67/api`).

### 2.3 Deploy

Click **Deploy**. Vercel will automatically:
- Install dependencies
- Run `yarn build`
- Deploy to their global CDN
- Give you a URL like `https://your-project.vercel.app`

### 2.4 Update Backend CORS

After getting your Vercel URL, go back to your EC2 instance and update the CORS:

```bash
cd area-1914

# Edit the .env file
nano backend/.env
# Update ALLOWED_ORIGINS to include your Vercel domain:
# ALLOWED_ORIGINS="https://your-project.vercel.app"

# Restart the backend to pick up changes
docker compose restart backend
```

---

## 3. SSL/HTTPS (Optional — Requires Domain Name)

Once you have a domain name pointing to your EC2 IP:

### 3.1 Install Certbot

```bash
# Amazon Linux 2023
sudo dnf install -y certbot python3-certbot-nginx

# Or Ubuntu
sudo apt install -y certbot python3-certbot-nginx
```

### 3.2 Update Nginx config

Update `nginx/nginx.conf` to use your domain in the `server_name` directive:
```nginx
server_name yourdomain.com;
```

### 3.3 Obtain Certificate

```bash
# Stop nginx container temporarily
docker compose stop nginx

# Get the certificate
sudo certbot certonly --standalone -d yourdomain.com

# Mount the certs in docker-compose.yml and update nginx.conf for SSL
# Then restart
docker compose up -d
```

---

## 4. Maintenance

### Backup the Database

```bash
# Copy the SQLite DB from the Docker volume to your local machine
docker cp area1914-backend:/app/data/area1914.db ./area1914-backup-$(date +%Y%m%d).db

# Or download to your local machine via SCP
scp -i your-key.pem ec2-user@YOUR_EC2_IP:~/area-1914/area1914-backup-*.db ./
```

### Monitor Resources

```bash
# Check container resource usage
docker stats

# Check disk space
df -h
```

### Auto-Restart on Reboot

Docker is already configured with `restart: unless-stopped` in `docker-compose.yml`, but ensure Docker starts on boot:

```bash
sudo systemctl enable docker
```

---

## Quick Reference

| Component | URL | Notes |
|---|---|---|
| Frontend | `https://your-project.vercel.app` | Vercel auto-deploys on push |
| Backend API | `http://YOUR_EC2_IP/api` | Through Nginx reverse proxy |
| API Docs | `http://YOUR_EC2_IP/api/docs` | Swagger UI |
| Health Check | `http://YOUR_EC2_IP/health` | Returns `{"status": "ok"}` |
