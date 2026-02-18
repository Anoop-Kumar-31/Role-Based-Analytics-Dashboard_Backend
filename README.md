# RBAC_Dashboard Backend - Free Forever Edition

A PostgreSQL/Supabase-optimized backend forrestaurant operations management, designed for free hosting on Render.

## 🎯 Features

- ✅ **PostgreSQL Ready** - Optimized for Supabase/Neon free tier
- ✅ **Zero Cost Hosting** - Configured for Render free tier
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Access Control** - Super Admin, Company Admin, Employee roles
- ✅ **Multi-Tenant Architecture** - Company and restaurant isolation
- ✅ **RESTful API** - Clean, documented endpoints
- ✅ **Production Ready** - Error handling, validation, security

## 📋 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase compatible)
- **ORM**: Sequelize
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**
```bash
npm install
```

2. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Run Database**
```bash
# Option 1: Use Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine

# Option 2: Use local PostgreSQL
# Make sure PostgreSQL is running on port 5432
```

4. **Create Database**
```bash
createdb breadcrumbs_dev
```

5. **Start Server**
```bash
npm run dev
```

Server will run on `http://localhost:8080`

## 🗄️ Database Setup

### For Production (Supabase)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Update `.env` with Supabase credentials:

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### Database Migration

The app will auto-sync models in development. For production, use migrations:

```bash
# Generate migration
npx sequelize-cli migration:generate --name init-database

# Run migrations
npm run migrate
```

## 📝 API Endpoints

### Authentication
- `POST /api/v1/users/signin` - Login

### Users
- `POST /api/v1/users` - Create user (Admin only)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Companies
- `POST /api/v1/companies` - Create company
- `GET /api/v1/companies/onboarded` - Get onboarded companies
- `GET /api/v1/companies/pending-onboarding` - Get pending (Super Admin)
- `PATCH /api/v1/onboarding/onboard/:id` - Approve company
- `PATCH /api/v1/onboarding/reject/:id` - Reject company

### Restaurants
- `POST /api/v1/restaurants` - Create restaurant
- `GET /api/v1/restaurants/by-company/:company_id` - Get by company
- `GET /api/v1/restaurants/:id` - Get by ID
- `PUT /api/v1/restaurants/:id` - Update restaurant
- `DELETE /api/v1/restaurants/:id` - Delete restaurant

### Revenue
- `POST /api/v1/restaurants/:id/revenue` - Create revenue entry
- `GET /api/v1/restaurants/revenue/all` - Get all revenues
- `PUT /api/v1/restaurants/revenue/:id` - Update revenue
- `DELETE /api/v1/restaurants/revenue/:id` - Delete revenue

### Expenses
- `POST /api/v1/expense` - Create expense
- `GET /api/v1/expense` - Get all expenses
- `PUT /api/v1/expense/:id` - Update expense
- `DELETE /api/v1/expense/:id` - Delete expense

### Blue Book
- `POST /api/v1/blue-book` - Create entry
- `GET /api/v1/blue-book/:restaurant_id/:date` - Get by date
- `PUT /api/v1/blue-book/:id` - Update entry
- `DELETE /api/v1/blue-book/:id` - Delete entry

## 🔐 Authentication

All endpoints except `/users/signin` and `/companies` (for onboarding) require authentication.

**Headers**:
```
x-access-token: YOUR_JWT_TOKEN
```

**Roles**:
- `Super_Admin` - Full system access
- `Company_Admin` - Company and restaurant management
- `Restaurant_Employee` - Basic operations

## 🚀 Deployment

### Deploy to Render (Free)

1. Push code to GitHub
2. Create account at [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add from `.env.example`
6. Deploy!

### Environment Variables for Render

```env
NODE_ENV=production
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=generate_random_32_char_string
FRONTEND_URL=https://your-frontend.vercel.app
```

## 📊 Database Models

- **User** - User accounts with roles
- **Company** - Restaurant companies/organizations
- **Restaurant** - Individual restaurant locations
- **UserRestaurant** - User-restaurant associations
- **Revenue** - Daily revenue tracking
- **Expense** - Expense tracking
- **BlueBook** - Daily operational logs

## 🔧 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
```

## 💡 Tips for Free Tier

1. **Keep Backend Warm**: Use [UptimeRobot](https://uptimerobot.com) (free) to ping `/health` every 5 minutes
2. **Connection Pooling**: Already configured for optimal free tier usage
3. **Database Size**: 500 MB on Supabase is enough for ~100,000 rows

## 🤝 Contributing

This is a portfolio project, but feedback welcome!

## 📄 License

MIT

---

**Built for free forever hosting** 🎉
