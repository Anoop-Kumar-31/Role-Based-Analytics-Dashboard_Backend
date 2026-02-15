# 🔄 Reset Database - Fresh Start

Quick guide to completely reset your database and start fresh.

---

## ⚡ Quick Reset (Recommended)

```bash
# 1. Stop the backend server (Ctrl+C if running)

# 2. Drop and recreate database
docker exec -it breadcrumbs-postgres psql -U postgres -c "DROP DATABASE IF EXISTS breadcrumbs_dev;"
docker exec -it breadcrumbs-postgres psql -U postgres -c "CREATE DATABASE breadcrumbs_dev;"

# 3. Start server (will auto-create tables and super admin)
npm run dev
```

**That's it!** ✅ Your database is now completely fresh with all tables and super admin created.

---

## 📋 Step-by-Step Guide

### Step 1: Stop Backend Server

If your server is running, stop it:
- Press `Ctrl+C` in the terminal where `npm run dev` is running

### Step 2: Drop Old Database

```bash
docker exec -it breadcrumbs-postgres psql -U postgres -c "DROP DATABASE IF EXISTS breadcrumbs_dev;"
```

**What this does:**
- Connects to PostgreSQL container
- Drops (deletes) the `breadcrumbs_dev` database
- All tables and data are removed
- `IF EXISTS` prevents errors if database doesn't exist

### Step 3: Create New Database

```bash
docker exec -it breadcrumbs-postgres psql -U postgres -c "CREATE DATABASE breadcrumbs_dev;"
```

**What this does:**
- Creates a brand new `breadcrumbs_dev` database
- Database is empty (no tables)

### Step 4: Start Server

```bash
npm run dev
```

**What happens:**
1. ✅ Server connects to database
2. ✅ Sequelize syncs models (creates all tables)
3. ✅ Super admin is created automatically
4. ✅ Server is ready!

**Console output:**
```
✅ Database connected successfully
📊 Database: breadcrumbs_dev@localhost
✅ Database models synchronized
✅ Super Admin created successfully
   Email: superAdmin@dashboard.com
   Password: super@admin
   Role: Super_Admin

🚀 Server running on port 8080
```

---

## 🔍 Verify Fresh Database

### Check Tables Were Created

```bash
docker exec -it breadcrumbs-postgres psql -U postgres -d breadcrumbs_dev -c "\dt"
```

**Expected output:**
```
                List of relations
 Schema |       Name        | Type  |  Owner   
--------+-------------------+-------+----------
 public | blue_books        | table | postgres
 public | companies         | table | postgres
 public | expenses          | table | postgres
 public | forecasts         | table | postgres
 public | pos               | table | postgres
 public | restaurants       | table | postgres
 public | revenues          | table | postgres
 public | sales_categories  | table | postgres
 public | targets           | table | postgres
 public | user_restaurants  | table | postgres
 public | users             | table | postgres
```


**Login:**
- Email: `superAdmin@dashboard.com`
- Password: `super@admin`
