# Production Test Credentials

This document contains test credentials for production deployment testing.

## Test Users

All users have the password: **`test`**

### 1. Super Admin
- **Email:** `superadmin`
- **Name:** Super Admin
- **Role:** SUPERADMIN
- **Access:** Full access to all features (single-tenant mode)
- **Use Case:** Testing superadmin features, site management, analytics

### 2. Restaurant Owner
- **Email:** `owner`
- **Name:** Monaghan Owner
- **Role:** OWNER
- **Access:** Full access to Monaghan's Bar & Grill site
- **Use Case:** Testing owner-level features, self-serve editing, analytics

### 3. Restaurant Manager
- **Email:** `manager`
- **Name:** Restaurant Manager
- **Role:** MANAGER
- **Access:** Limited access to Monaghan's Bar & Grill site
- **Use Case:** Testing manager-level features, content management

### 4. Restaurant Staff
- **Email:** `staff`
- **Name:** Restaurant Staff
- **Role:** STAFF
- **Access:** Read-only access to Monaghan's Bar & Grill site
- **Use Case:** Testing staff-level features, viewing content

## Sample Data

The seed script creates:

- **Site:** Monaghan's Bar & Grill (`monaghans-bargrill`)
- **Events:** Live Music Friday, Trivia Night
- **Specials:** Monday Burger Special, Happy Hour
- **Memberships:** All users (except superadmin) are members of Monaghan's site

## Running the Seed Script

```bash
npm run db:seed
```

Or manually:
```bash
npx tsx prisma/seed.ts
```

## Notes

- All passwords are set to `test` for easy testing
- Users are created with proper role-based access
- Sample data provides realistic content for testing
- Multi-tenant features have been disabled - this is now a single-tenant CMS
- Superadmin has full access but stays within the single site context
