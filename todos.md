# FOOBAR — Master Runbook (Crash-Proof)

> **How any new chat/agent should resume work**
> 1) Open this file.
> 2) Go to **📍 Current Status & Next Step** and do the first unchecked task.
> 3) After finishing a task, run: `npm run status -- --set <TASK-ID>=done`.
> 4) If anything breaks, re-read **Recovery After a Crash** at the bottom and keep going.

---

## 📍 Current Status & Next Step
- **Branch:** main
- **Platform Host (Superadmin):** www.byte-by-bite.com
- **Tenants:** monaghansbargrill.com (first)
- **Last Updated:** 2025-01-20T00:00:00.000Z
- **Status:** All core tasks completed! System is production-ready.

**Current Broncos Tasks:**
- [x] Get Broncos 2024 schedule
- [x] Add Broncos games to events page  
- [x] Create potluck event type in CMS
- [x] Add random main dishes for potlucks
- [x] Make sure the nav is the same on the home page as it is on the other pages
- [x] Create data objects for all games of the football season but only display the next 3
- [x] Update schedule to 2025-2026 season (current season)

## 🎉 Project Status: COMPLETE

All major tasks have been completed successfully:
- ✅ Multi-tenant architecture with RBAC
- ✅ Authentication and authorization system
- ✅ Admin dashboards and site management
- ✅ Domain verification and DNS management
- ✅ SEO optimization and JSON-LD
- ✅ Accessibility compliance
- ✅ Event and specials management
- ✅ AI intake wizard
- ✅ Menu parsing system
- ✅ Analytics and telemetry
- ✅ Backup and rollback system
- ✅ Broncos games and potluck system

## 📋 Active TODOs
See `docs/TODO.md` for all pending tasks and future enhancements.

## 🚫 Guidelines
See `docs/NEVER_DO.md` for comprehensive coding and content guidelines.

---

## Recovery After a Crash

If the system breaks or needs to be restarted:

1. **Check current status**: Run `npm run status` to see current state
2. **Verify environment**: Run `npm run verify-env` to check all required variables
3. **Run tests**: Run `npm test` to ensure basic functionality
4. **Build check**: Run `npm run build` to verify compilation
5. **Check logs**: Review any error logs in the `logs/` directory
6. **Database status**: Check Prisma connection and migrations
7. **Deploy status**: Verify Vercel deployment is healthy

The system is designed to be crash-proof with comprehensive error handling and recovery mechanisms.