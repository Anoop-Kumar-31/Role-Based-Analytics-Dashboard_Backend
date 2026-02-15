# Entity Relationship Diagram - GetBreadCrumbs Database

## Database: `breadcrumbs_dev`
**Container:** `breadcrumbs-postgres`  
**PostgreSQL Version:** 15-alpine

---

## Tables Overview

| Table | Primary Key | Purpose |
|-------|-------------|---------|
| **companies** | company_id (UUID) | Stores company/organization information |
| **users** | user_id (UUID) | Stores user accounts and authentication |
| **restaurants** | restaurant_id (UUID) | Stores restaurant locations |
| **user_restaurants** | id (auto) | Junction table linking users to restaurants |
| **revenues** | revenue_id (UUID) | Stores daily revenue records |
| **expenses** | expense_id (UUID) | Stores expense transactions |
| **blue_books** | blue_book_id (UUID) | Stores daily operational records |

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   COMPANIES     │
│─────────────────│
│ company_id (PK) │◄─────┐
│ company_name    │      │
│ company_email   │      │ 1:Many
│ company_phone   │      │
│ is_onboarded    │      │
│ is_active       │      │
│ createdAt       │      │
│ updatedAt       │      │
└─────────────────┘      │
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          │              │              │
    ┌─────▼──────┐  ┌────▼──────────┐   │
    │   USERS    │  │  RESTAURANTS  │   │
    │────────────│  │───────────────│   │
    │user_id (PK)│  │restaurant_id  │   │
    │first_name  │  │     (PK)      │   │
    │last_name   │  │restaurant_name│   │
    │email       │  │restaurant_addr│   │
    │password    │  │company_id (FK)│───┘
    │role        │  │is_active      │
    │company_id  │  │createdAt      │
    │  (FK)      │──┘updatedAt      │
    │is_active   │  └───────┬───────┘
    │is_blocked  │          │
    │phone_number│          │ 1:Many
    │last_login  │          │
    │createdAt   │          │
    │updatedAt   │          │
    └─────┬──────┘          │
          │                 │
          │ Many:Many       │
          │                 │
    ┌─────▼─────────────────▼─────┐
    │    USER_RESTAURANTS         │
    │─────────────────────────────│
    │ id (PK)                     │
    │ user_id (FK) ────────────┐  │
    │ restaurant_id (FK) ──┐   │  │
    │ createdAt            │   │  │
    │ updatedAt            │   │  │
    └──────────────────────┼───┼──┘
                           │   │
          ┌────────────────┘   └─────────────┐
          │                                  │
          │ 1:Many                           │ 1:Many
          │                                  │
    ┌─────▼──────────┐  ┌────────────┐  ┌───▼─────────┐
    │   REVENUES     │  │  EXPENSES  │  │ BLUE_BOOKS  │
    │────────────────│  │────────────│  │─────────────│
    │revenue_id (PK) │  │expense_id  │  │blue_book_id │
    │restaurant_id   │  │   (PK)     │  │    (PK)     │
    │    (FK)        │  │restaurant  │  │restaurant_id│
    │user_id (FK)    │  │  _id (FK)  │  │    (FK)     │
    │date            │  │user_id(FK) │  │user_id (FK) │
    │total_sales     │  │category    │  │date         │
    │createdAt       │  │amount      │  │data (JSONB) │
    │updatedAt       │  │date        │  │createdAt    │
    └────────────────┘  │description │  │updatedAt    │
                        │createdAt   │  └─────────────┘
                        │updatedAt   │
                        └────────────┘
```

---

## Foreign Key Relationships

| From Table | From Column | To Table | To Column | Relationship |
|------------|-------------|----------|-----------|--------------|
| **users** | company_id | companies | company_id | Many-to-One |
| **restaurants** | company_id | companies | company_id | Many-to-One |
| **user_restaurants** | user_id | users | user_id | Many-to-One |
| **user_restaurants** | restaurant_id | restaurants | restaurant_id | Many-to-One |
| **revenues** | restaurant_id | restaurants | restaurant_id | Many-to-One |
| **revenues** | user_id | users | user_id | Many-to-One |
| **expenses** | restaurant_id | restaurants | restaurant_id | Many-to-One |
| **expenses** | user_id | users | user_id | Many-to-One |
| **blue_books** | restaurant_id | restaurants | restaurant_id | Many-to-One |
| **blue_books** | user_id | users | user_id | Many-to-One |

---

## Relationship Descriptions

### Company Hierarchy
```
Company (1) ──< Users (Many)
Company (1) ──< Restaurants (Many)
```
- One company can have multiple users
- One company can own multiple restaurants
- Users belong to one company
- Restaurants belong to one company

### User-Restaurant Access
```
Users (Many) ──< UserRestaurants >── Restaurants (Many)
```
- Many-to-Many relationship via junction table
- One user can access multiple restaurants
- One restaurant can be accessed by multiple users
- Enforces access control for restaurant data

### Operational Data
```
Restaurant (1) ──< Revenues (Many)
Restaurant (1) ──< Expenses (Many)
Restaurant (1) ──< BlueBooks (Many)

User (1) ──< Revenues (Many)
User (1) ──< Expenses (Many)
User (1) ──< BlueBooks (Many)
```
- Each revenue/expense/bluebook record belongs to one restaurant
- Each record is created by one user (audit trail)
- Allows tracking who entered what data

---

## Sequelize Models Mapping

| Database Table | Sequelize Model | File Path |
|----------------|-----------------|-----------|
| companies | Company | `src/models/Company.js` |
| users | User | `src/models/User.js` |
| restaurants | Restaurant | `src/models/Restaurant.js` |
| user_restaurants | UserRestaurant | `src/models/UserRestaurant.js` |
| revenues | Revenue | `src/models/Revenue.js` |
| expenses | Expense | `src/models/Expense.js` |
| blue_books | BlueBook | `src/models/BlueBook.js` |

---

## Key Design Patterns

### 1. **Multi-Tenancy via Company**
- Companies are the top-level tenant
- All data is scoped to a company
- Users can only belong to one company
- Restaurants are owned by companies

### 2. **Role-Based Access Control**
- User roles: `Super_Admin`, `Company_Admin`, `Restaurant_Employee`
- Stored in `users.role` (ENUM)
- Controls what operations users can perform

### 3. **Soft Deletes**
- Most tables have `is_active` boolean
- Records are marked inactive instead of deleted
- Preserves data integrity and audit trail

### 4. **Audit Trail**
- All tables have `createdAt` and `updatedAt`
- Revenues, Expenses, BlueBooks have `user_id`
- Tracks who created/modified records

### 5. **Flexible Data Storage**
- BlueBooks use JSONB for `data` column
- Allows storing complex daily operational data
- Schema-less for flexibility

---

## Data Flow Example: Onboarding

When a new company is onboarded via **POST `/api/v1/onboarding`**:

```
1. Create Company
   └─ companies table: new row with is_onboarded=false

2. Create Admin User
   └─ users table: new row with company_id, role='Company_Admin'

3. Create Restaurants
   └─ restaurants table: new rows with company_id

4. Link User to Restaurants
   └─ user_restaurants table: new rows linking user to all restaurants

5. Super Admin Approves
   └─ companies table: update is_onboarded=true
```

---

## Database Statistics Query

To see table sizes and row counts:

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Indexes

PostgreSQL automatically creates indexes on:
- All primary keys
- All foreign keys
- Unique constraints (e.g., `users.email`)

For performance, consider adding indexes on:
```sql
-- Frequently queried columns
CREATE INDEX idx_revenues_date ON revenues(date);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_blue_books_date ON blue_books(date);

-- Composite indexes for common queries
CREATE INDEX idx_revenues_restaurant_date ON revenues(restaurant_id, date);
CREATE INDEX idx_expenses_restaurant_date ON expenses(restaurant_id, date);
```

---

## Connection to Original Backend

This simplified schema matches the core structure of the original backend but omits:
- **Forecasts** table (monthly revenue predictions)
- **Targets** table (labor and COGS targets)
- **Sales_Categories** table (beverage/food categories)
- **Payroll** related tables
- **Inventory** tables

These were excluded to keep the free-tier backend lightweight.

---

## Visual Tools for Further Exploration

### dbdiagram.io Format (DBML)

```dbml
Table companies {
  company_id uuid [pk]
  company_name varchar
  company_email varchar
  company_phone varchar
  is_onboarded boolean
  is_active boolean
  createdAt timestamp
  updatedAt timestamp
}

Table users {
  user_id uuid [pk]
  first_name varchar
  last_name varchar
  email varchar [unique]
  password varchar
  role enum
  company_id uuid [ref: > companies.company_id]
  is_active boolean
  is_blocked boolean
  phone_number varchar
  last_login timestamp
  createdAt timestamp
  updatedAt timestamp
}

Table restaurants {
  restaurant_id uuid [pk]
  restaurant_name varchar
  restaurant_address varchar
  restaurant_city varchar
  restaurant_state varchar
  restaurant_zip varchar
  restaurant_phone varchar
  restaurant_email varchar
  company_id uuid [ref: > companies.company_id]
  is_active boolean
  createdAt timestamp
  updatedAt timestamp
}

Table user_restaurants {
  id int [pk, increment]
  user_id uuid [ref: > users.user_id]
  restaurant_id uuid [ref: > restaurants.restaurant_id]
  createdAt timestamp
  updatedAt timestamp
}

Table revenues {
  revenue_id uuid [pk]
  restaurant_id uuid [ref: > restaurants.restaurant_id]
  user_id uuid [ref: > users.user_id]
  date date
  total_sales decimal
  createdAt timestamp
  updatedAt timestamp
}

Table expenses {
  expense_id uuid [pk]
  restaurant_id uuid [ref: > restaurants.restaurant_id]
  user_id uuid [ref: > users.user_id]
  category varchar
  amount decimal
  date date
  description text
  createdAt timestamp
  updatedAt timestamp
}

Table blue_books {
  blue_book_id uuid [pk]
  restaurant_id uuid [ref: > restaurants.restaurant_id]
  user_id uuid [ref: > users.user_id]
  date date
  data jsonb
  createdAt timestamp
  updatedAt timestamp
}
```

**To visualize:** Copy the DBML above to [dbdiagram.io](https://dbdiagram.io/d) for an interactive diagram!

---

## Summary

- **7 tables** total
- **10 foreign key relationships**
- **Multi-tenant architecture** (company-based)
- **Many-to-many** user-restaurant access control
- **Audit trails** on all operational data
- **Soft deletes** for data preservation
- **UUID primary keys** for distributed systems
