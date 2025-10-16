# Production Credentials

This document contains credentials for production deployment.

## Users

All users have the password: **`test`**

### 1. Super Admin
- **Username:** `jt`
- **Password:** `test`
- **Role:** SUPERADMIN
- **Access:** Full access to all features (single-tenant mode)

### 2. Restaurant Owner
- **Username:** `owner`
- **Password:** `test`
- **Role:** OWNER
- **Access:** Full access to Monaghan's Bar & Grill site

### 3. Restaurant Manager
- **Username:** `manager`
- **Password:** `test`
- **Role:** MANAGER
- **Access:** Limited access to Monaghan's Bar & Grill site

### 4. Restaurant Staff
- **Username:** `staff`
- **Password:** `test`
- **Role:** STAFF
- **Access:** Read-only access to Monaghan's Bar & Grill site

## Sample Data

The seed script creates:

- **Site:** Monaghan's Bar & Grill (`monaghans-bargrill`)
- **Events:** Live Music Friday, Trivia Night
- **Specials:** Monday Burger Special, Happy Hour
- **Memberships:** All users are members of Monaghan's site

## Running the Seed Script

```bash
npm run db:seed
```

Or manually:
```bash
npx tsx prisma/seed.ts
```

## Notes

- All passwords are set to `test`
- Usernames follow a simple first-name pattern (no email addresses needed)
- Users are created with proper role-based access
- Sample data provides realistic content for testing
- Multi-tenant features have been disabled - this is now a single-tenant CMS
- For new users, follow the pattern: `firstname` or `first_last` for the username field
