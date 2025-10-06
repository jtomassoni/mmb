# Monaghan's Bar & Grill - Restaurant CMS

A single-tenant restaurant management system built with Next.js, featuring menu management, events, specials, and analytics.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:seed
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** to see the restaurant site
5. **Login at [http://localhost:3000/login](http://localhost:3000/login)** to access the CMS

### Test Credentials

All users have the password: **`test`**

- **Super Admin:** `superadmin@monaghans.com` - Full system access
- **Owner:** `owner@monaghans.com` - Full site management
- **Manager:** `manager@monaghans.com` - Content management
- **Staff:** `staff@monaghans.com` - Read-only access

## 📋 Features

- **Menu Management** - Upload and manage menu items
- **Events Calendar** - Create and manage events
- **Specials** - Manage daily/weekly specials
- **Analytics** - Track site performance
- **Role-Based Access** - Different permission levels
- **Responsive Design** - Works on all devices

## 🚀 Deployment

### Coming Soon Page (Quick Deploy)

Deploy a beautiful "coming soon" page while you work on the CMS:

```bash
./deploy.sh coming-soon
vercel --prod
```

### Full CMS Deployment

When ready to deploy the complete system:

```bash
./deploy.sh full
vercel --prod
```

**Important:** Make sure to set up your production database and environment variables before deploying the full CMS.

## 🛠️ Development

### Database Commands

```bash
# Reset and seed database
npm run db:reset

# Run migrations
npx prisma migrate dev

# View database
npx prisma studio
```

### Testing

```bash
# Run tests
npm test

# Run Playwright tests
npm run test:e2e
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
├── lib/                 # Utility functions and configurations
└── hooks/               # Custom React hooks

prisma/
├── schema.prisma        # Database schema
└── seed.ts             # Database seeding script
```

## 🔧 Configuration

- **Database:** SQLite (development) / PostgreSQL (production)
- **Authentication:** NextAuth.js with credentials
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (recommended)

## 📚 Documentation

- [Test Credentials](./docs/PROD_TEST_CREDENTIALS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Backup Procedures](./docs/BACKUP.md)

## 🎯 Roadmap

- [ ] Multi-tenant support (future)
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Online ordering integration

---

Built with ❤️ for restaurant owners who want to manage their digital presence easily.
