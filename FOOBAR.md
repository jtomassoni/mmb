# FOOBAR — Master Runbook (Crash-Proof)

> **How any new chat/agent should resume work**
> 1) Open this file.
> 2) Go to **📍 Current Status & Next Step** and do the first unchecked task.
> 3) After finishing a task, run: `npm run status -- --set <TASK-ID>=done`.
> 4) If anything breaks, re-read **Recovery After a Crash** at the bottom and keep going.

---

## 📍 Current Status & Next Step
- **Branch:** recovery/restart-20250918-1837
- **Platform Host (Superadmin):** www.byte-by-bite.com
- **Tenants:** monaghansbargrill.com (first)
- **Last Updated:** 2025-09-19T07:45:00.000Z
**Next Step:** All core tasks completed! 🎉

**Task Checklist (auto-synced from docs/status.json):**
<!-- TASKS-LIST:DO-NOT-EDIT-MANUALLY -->
- [x] TASK-00 — Create FOOBAR.md runbook
  - [x] 00A — Create FOOBAR.md with runbook content verbatim
  - [x] 00B — Ensure marker <!-- TASKS-LIST:DO-NOT-EDIT-MANUALLY --> present
  - [x] 00C — Commit snapshot [TASK-00]
- [x] TASK-01 — Create recovery branch
  - [x] 01A — Create branch recovery/restart-$(date +%Y%m%d-%H%M)
  - [x] 01B — Commit current state [TASK-01]
- [x] TASK-02 — Repo audit & scaffold missing infra
  - [x] 02A — Run bootstrap script to create folders, .gitkeep, .env.local
  - [x] 02B — Add verify-env predev gate
  - [x] 02C — Commit [TASK-02]
- [x] TASK-03 — Prisma multi-tenant models present
  - [x] 03A — Define models with siteId scoping; no cross-tenant leakage
  - [x] 03B — Add Role enum: SUPERADMIN, OWNER, MANAGER, STAFF
  - [x] 03C — Run migration + seed minimal data
- [x] TASK-04 — Auth.js + RBAC + redirect rules
  - [x] 04A — Configure Auth.js with Prisma adapter
  - [x] 04B — Implement RBAC helper + server-side guards
  - [x] 04C — Redirect callback per role
- [x] TASK-05 — Middleware host routing + superadmin lock
  - [x] 05A — Detect host and path; lock /resto-admin to platform
  - [x] 05B — Add matcher for all paths
  - [x] 05C — Tests cover redirection behaviour
- [x] TASK-06 — Admin (site) + Superadmin dashboards
  - [x] 06A — Superadmin list: Sites, Domains, Users
  - [x] 06B — Per-site Admin shell with nav
  - [x] 06C — Access tests (RBAC)
- [x] TASK-07 — Create Site wizard
  - [x] 07A — Basics → name, host label, business type
  - [x] 07B — Owner invite (email) optional
  - [x] 07C — Seed Hours/Events/Specials defaults
- [x] TASK-08 — Vercel Domain add/verify API
  - [x] 08A — Add domain via Vercel API if token provided
  - [x] 08B — Verify endpoint + polling/backoff
  - [x] 08C — Hourly cron for PENDING
- [x] TASK-09 — Per-host SEO (sitemap/robots/JSON-LD)
  - [x] 09A — Dynamic sitemap per host (App Router)
  - [x] 09B — robots.txt per host with disallow rules for /admin,/resto-admin
  - [x] 09C — Inject LocalBusiness/Menu/Event JSON-LD
  - [x] 09D — Lighthouse SEO ≥ 90 on tenant + platform
- [x] TASK-10 — SPA home sections + routes
  - [x] 10A — Home sections composed, fast LCP
  - [x] 10B — Routes: /menu /specials /events /reviews /about /visit
  - [x] 10C — Prefetch & image optimization
- [x] TASK-11 — Accessibility toolbar + a11y passes
  - [x] 11A — Toolbar with persisted preferences & aria-live
  - [x] 11B — Skip links, focus rings, keyboard traps eliminated
  - [x] 11C — Axe & Lighthouse a11y thresholds
- [x] TASK-12 — Footer/header Login + role redirects
  - [x] 12A — Footer button + optional header link
  - [x] 12B — Cross-host login redirect logic validated
- [x] TASK-13 — Health cards & scheduled pings
  - [x] 13A — Ping job writes HealthPing rows
  - [x] 13B — Cards query recent metrics
  - [x] 13C — Error states & empty states handled
- [x] TASK-14 — Events defaults (Mon poker, Thu bingo, Sun potluck)
  - [x] 14A — Create admin events management interface (no seeding)
  - [x] 14B — Render on /events with JSON-LD Event
  - [x] 14C — Admin edit + publish/unpublish
- [x] TASK-15 — 30 rotating specials in CMS
  - [x] 15A — Create admin specials management interface (no seeding)
  - [x] 15B — Admin CRUD with schedule toggle
  - [x] 15C — Public listing + mini section
- [x] TASK-16 — Images alt text wired
  - [x] 16A — Map filenames → fixed alt per runbook list
  - [x] 16B — Fallback alt rules for new media
  - [x] 16C — Axe pass for images
- [x] TASK-17 — Playwright + Axe + Lighthouse CI
  - [x] 17A — Playwright smoke flows (public + admin)
  - [x] 17B — Axe integration for a11y assertions
  - [x] 17C — Lighthouse CI with budgets/thresholds
- [x] TASK-18 — Monaghans domain attached & verified
  - [x] 18A — Add domain via UI/API
  - [x] 18B — DNS records correct (CNAME/A/ALIAS)
  - [x] 18C — Verify + smoke test routes
- [x] TASK-19 — AI intake wizard (tailored Q&A by business type)
  - [x] 19A — Blueprint: type-specific question sets (dive bar/café/fine dining)
  - [x] 19B — Prompt packs + slot map (hours, parking, TVs, reservations)
  - [x] 19C — UX: chat → preview site → accept → seed
  - [x] 19D — PII/profanity guardrails + follow-up flags
  - [x] 19E — Fixtures & tests for nonsense input
- [x] TASK-20 — Menu parser (PDF/image → structured Specials/Menu rows)
  - [x] 20A — OCR pipeline + price/emoji scrub
  - [x] 20B — Section classifier (Breakfast/Lunch/Dinner/Drinks)
  - [x] 20C — Owner review + approval flow
  - [x] 20D — Unit tests on 5 menus with accuracy target
- [x] TASK-21 — DNS auto-provisioner (hide steps when Vercel API succeeds)
  - [x] 21A — ENV checks VERCEL_* present; helpful errors
  - [x] 21B — Add domain + store verification TXT if needed
  - [x] 21C — Verify loop with exponential backoff
  - [x] 21D — Failure telemetry + surfaced messages
- [x] TASK-22 — Template variants (dive bar / fine dining / café)
  - [x] 22A — Variant tokens (type scale/spacing/contrast)
  - [x] 22B — Hero/Today presets per variant
  - [x] 22C — JSON-LD subtype presets
  - [x] 22D — Playwright snapshots per variant
- [x] TASK-23 — Owner self-serve edits (hours, specials, events) with autosave & audit
  - [x] 23A — RBAC guard + optimistic autosave
  - [x] 23B — AuditLog on every change
  - [x] 23C — Undo soft-revert within 20 minutes
- [x] TASK-24 — Backup & rollback (DB + media to object storage)
  - [x] 24A — Nightly cron → S3/Backblaze
  - [x] 24B — Restore latest/by date command
  - [x] 24C — Disaster drill script + doc
- [x] TASK-25 — Basic analytics (pageviews, CTA clicks, top specials)
  - [x] 25A — Edge/server events + beacon
  - [x] 25B — Dashboard filters + date ranges
  - [x] 25C — Privacy + bot filtering
- [x] TASK-26 — Billing stub (Stripe subscription: base + add-ons) [CANCELLED - Pro bono project]
  - [x] 26A — Create Stripe products/prices [SKIPPED]
  - [x] 26B — Webhook handler (invoice.paid/failed, customer.deleted) [SKIPPED]
  - [x] 26C — Grace period + locked UI state [SKIPPED]
