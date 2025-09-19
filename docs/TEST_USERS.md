# Test Users for Local Development

This document outlines the test users available for local development and testing.

## Available Test Users

All users have the password: **`test`**

### 1. Super Admin
- **Email:** `superadmin@monaghans.com`
- **Name:** Super Admin
- **Role:** SUPERADMIN
- **Access:** Full access to all sites and features
- **Use Case:** Testing superadmin features, site management, analytics

### 2. Restaurant Owner
- **Email:** `owner@monaghans.com`
- **Name:** Monaghan Owner
- **Role:** OWNER
- **Access:** Full access to Monaghan's Bar & Grill site
- **Use Case:** Testing owner-level features, self-serve editing, analytics

### 3. Restaurant Manager
- **Email:** `manager@monaghans.com`
- **Name:** Restaurant Manager
- **Role:** MANAGER
- **Access:** Limited access to Monaghan's Bar & Grill site
- **Use Case:** Testing manager-level features, content management

### 4. Restaurant Staff
- **Email:** `staff@monaghans.com`
- **Name:** Restaurant Staff
- **Role:** STAFF
- **Access:** Read-only access to Monaghan's Bar & Grill site
- **Use Case:** Testing staff-level features, viewing content

## Sample Data

The seed script also creates:

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
- The superadmin user has access to all features across all sites
