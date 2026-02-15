# BreadCrumbs Backend - Docker Setup Guide

Complete guide for setting up and running the BreadCrumbs backend with Docker PostgreSQL.

---

## 🚀 Quick Start

```bash
# 1. Start PostgreSQL
docker start breadcrumbs-postgres

# 2. Start backend server
npm run dev
```

---

## 📋 Prerequisites

- **Docker** installed and running
- **Node.js** (v14 or higher) and npm installed
- **Git** (for cloning the repository)

---

## 🐘 PostgreSQL Setup (First Time Only)

### Step 1: Create PostgreSQL Container

Run this command to create a new PostgreSQL container:

```bash
docker run --name breadcrumbs-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
```

**What this does:**
- `--name breadcrumbs-postgres` → Names the container for easy reference
- `-e POSTGRES_PASSWORD=postgres` → Sets the default postgres user password
- `-p 5432:5432` → Maps PostgreSQL port from container to host
- `-d` → Runs container in detached/background mode
- `postgres:15-alpine` → Uses lightweight Alpine-based PostgreSQL 15

### Step 2: Create Development Database

Once the container is running, create the database:

```bash
docker exec -it breadcrumbs-postgres psql -U postgres -c "CREATE DATABASE breadcrumbs_dev;"
```

**What this does:**
- `docker exec -it` → Executes an interactive command inside the container
- `breadcrumbs-postgres` → Target container name
- `psql -U postgres` → Runs PostgreSQL client as postgres user
- `-c "CREATE DATABASE breadcrumbs_dev;"` → Creates the development database

✅ You only need to run these commands **once** during initial setup!

### Step 3: Super Admin Account

When you start the server for the first time, a Super Admin account will be created automatically:

**Credentials:**
- Email: `superAdmin@dashboard.com`
- Password: `super@admin`
- Role: `Super_Admin`

> ⚠️ **Security Note**: Change this password in production! This is a default development account.

---

## 🏃 Daily Development Workflow

### Start the Database

```bash
docker start breadcrumbs-postgres
```

> **Note:** You only need this if the container is stopped. Docker containers persist between restarts.

### Start the Backend Server

```bash
npm run dev
```

The server will start with hot-reload enabled for development.

---

## 🔍 Verify Setup

### Check Docker Container Status

```bash
docker ps
```

You should see `breadcrumbs-postgres` in the list of running containers.

### Check Database Connection

```bash
docker exec -it breadcrumbs-postgres psql -U postgres -c "\l"
```

You should see `breadcrumbs_dev` in the list of databases.

---

## ⚙️ Configuration

Ensure your `config/config.json` has these database settings:

```json
{
  "development": {
    "username": "postgres",
    "password": "postgres",
    "database": "breadcrumbs_dev",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres"
  }
}
```

---

## 🛠️ Troubleshooting

### Container Name Already in Use

**Error:** `The container name "/breadcrumbs-postgres" is already in use`

**Solution:**
```bash
# Remove the existing container
docker rm breadcrumbs-postgres

# Then run the initial setup command again
docker run --name breadcrumbs-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
```

### Port 5432 Already in Use

**Error:** `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution Option 1** - Stop existing PostgreSQL:
```bash
# On Windows
net stop postgresql-x64-15

# On Linux/Mac
sudo service postgresql stop
```

**Solution Option 2** - Use a different port:
```bash
# Use port 5433 instead
docker run --name breadcrumbs-postgres -e POSTGRES_PASSWORD=postgres -p 5433:5432 -d postgres:15-alpine
```
> Remember to update `config/config.json` port to `5433`

### Database Connection Refused

**Solution:**
```bash
# Check if container is running
docker ps

# If not running, start it
docker start breadcrumbs-postgres

# Check container logs for errors
docker logs breadcrumbs-postgres
```

### Cannot Drop Database (Active Connections)

**Solution:**
```bash
# Terminate all connections to the database
docker exec -it breadcrumbs-postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'breadcrumbs_dev';"

# Now you can drop if needed
docker exec -it breadcrumbs-postgres psql -U postgres -c "DROP DATABASE breadcrumbs_dev;"
```

---

## 🗑️ Clean Up

### Stop the Container

```bash
docker stop breadcrumbs-postgres
```

### Remove the Container

```bash
docker rm breadcrumbs-postgres
```

### Remove the Image (Optional)

```bash
docker rmi postgres:15-alpine
```

---

## 📚 Useful Commands

### Access PostgreSQL Shell

```bash
docker exec -it breadcrumbs-postgres psql -U postgres -d breadcrumbs_dev
```

### View Container Logs

```bash
docker logs breadcrumbs-postgres
```

### Restart Container

```bash
docker restart breadcrumbs-postgres
```

### Backup Database

```bash
docker exec -it breadcrumbs-postgres pg_dump -U postgres breadcrumbs_dev > backup.sql
```

### Restore Database

```bash
docker exec -i breadcrumbs-postgres psql -U postgres breadcrumbs_dev < backup.sql
```

---

## 🎯 Production Notes

**Warning:** This setup is for **development only**.

For production:
- Use environment variables for sensitive credentials
- Enable SSL/TLS connections
- Use Docker volumes for data persistence
- Implement proper backup strategies
- Use managed PostgreSQL services (AWS RDS, Supabase, etc.)
