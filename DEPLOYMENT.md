# 🚀 Deployment Guide - Monaghan's Bar & Grill Website

## Overview
This is a Next.js application for Monaghan's Bar & Grill, designed to run on Vercel.

## Architecture
```
Main Host: mmb-five.vercel.app (Restaurant website)
Admin Interface: mmb-five.vercel.app/admin (Admin dashboard)
```

## Vercel Configuration

### Environment Variables
Set these in your Vercel project settings:

```bash
# Authentication
NEXTAUTH_URL=https://mmb-five.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Database (SQLite for development, PostgreSQL for production)
DATABASE_URL=postgresql://user:password@host:port/database

# Vercel API (for domain management)
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-project-id
```

### Domain Setup Process

1. **Main Domain (mmb-five.vercel.app)**
   - Add to Vercel project settings
   - Configure DNS: CNAME to `cname.vercel-dns.com`

## Deployment Steps

### 1. Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 2. Configure Environment Variables
In Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add all required variables (see above)

### 3. Database Setup
```bash
# For production, use PostgreSQL
# Update DATABASE_URL in Vercel environment variables
# Run migrations
npx prisma migrate deploy
```

### 4. Domain Configuration
```bash
# Add main domain
vercel domains add mmb-five.vercel.app
```

## Scaling Strategy

### Phase 1: Single Project (Current)
- **Cost**: Vercel Pro ($20/month)
- **Capacity**: 5-10 restaurant clients
- **Domains**: Unlimited custom domains per project

### Phase 2: Multiple Projects (Future)
- **Cost**: $20/month per project
- **Capacity**: 10-50 restaurant clients
- **Domains**: Each project can have unlimited domains

### Phase 3: Enterprise (Scale)
- **Cost**: Custom pricing
- **Capacity**: 50+ restaurant clients
- **Features**: Advanced domain management, priority support

## Monitoring & Health Checks

### Health Dashboard
- Access: `/resto-admin` (Superadmin only)
- Shows: Active sites, recent edits, events, specials, uptime

### Automated Health Checks
- Cron job: Every 5 minutes
- Endpoint: `/api/cron/health-check`
- Tracks: Response times, uptime, domain status

## Security Features

### Authentication
- NextAuth.js with role-based access control
- SUPERADMIN: Platform management
- OWNER/MANAGER/STAFF: Restaurant management

### Host Routing
- Middleware automatically routes based on hostname
- Platform routes: `/resto-admin/*`
- Tenant routes: Restaurant-specific content

### Data Isolation
- All data scoped by `siteId`
- No cross-tenant data leakage
- Audit logging for all changes

## Troubleshooting

### Common Issues

1. **Domain not resolving**
   - Check DNS configuration
   - Verify domain added to Vercel project
   - Check domain status in `/resto-admin/domains`

2. **Authentication issues**
   - Verify NEXTAUTH_URL matches deployment URL
   - Check NEXTAUTH_SECRET is set
   - Ensure database connection is working

3. **Database errors**
   - Check DATABASE_URL format
   - Run `npx prisma migrate deploy`
   - Verify database permissions

### Support
- Check health dashboard for system status
- Review logs in Vercel dashboard
- Use domain management UI for domain issues

## Cost Estimation

### Development (Free Tier)
- **Cost**: $0/month
- **Limits**: 100GB bandwidth, 100GB storage
- **Perfect for**: Development and testing

### Production (Pro Tier)
- **Cost**: $20/month
- **Limits**: 1TB bandwidth, 100GB storage
- **Perfect for**: 5-10 restaurant clients

### Scale (Enterprise)
- **Cost**: Custom pricing
- **Limits**: Unlimited bandwidth, custom storage
- **Perfect for**: 50+ restaurant clients

## Next Steps

1. **Deploy to Vercel**: Follow deployment steps above
2. **Configure domains**: Add platform and tenant domains
3. **Test functionality**: Verify all features work
4. **Monitor performance**: Use health dashboard
5. **Scale as needed**: Upgrade plan when ready
