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
- **Last Updated:** 2025-09-19T01:13:45.000Z
**Next Step:** TASK-00/00A — Create FOOBAR.md with runbook content verbatim

**Task Checklist (auto-synced from docs/status.json):**
<!-- TASKS-LIST:DO-NOT-EDIT-MANUALLY -->
- [ ] TASK-00 — Create FOOBAR.md runbook
  - [x] 00A — Create FOOBAR.md with runbook content verbatim
  - [x] 00B — Ensure marker <!-- TASKS-LIST:DO-NOT-EDIT-MANUALLY --> present
  - [ ] 00C — Commit snapshot [TASK-00]
- [ ] TASK-01 — Create recovery branch
  - [ ] 01A — Create branch recovery/restart-$(date +%Y%m%d-%H%M)
  - [ ] 01B — Commit current state [TASK-01]
- [ ] TASK-02 — Repo audit & scaffold missing infra
  - [ ] 02A — Run bootstrap script to create folders, .gitkeep, .env.local
  - [ ] 02B — Add verify-env predev gate
  - [ ] 02C — Commit [TASK-02]
- [ ] TASK-03 — Prisma multi-tenant models present
  - [ ] 03A — Define models with siteId scoping; no cross-tenant leakage
  - [ ] 03B — Add Role enum: SUPERADMIN, OWNER, MANAGER, STAFF
  - [ ] 03C — Run migration + seed minimal data
- [ ] TASK-04 — Auth.js + RBAC + redirect rules
  - [ ] 04A — Configure Auth.js with Prisma adapter
  - [ ] 04B — Implement RBAC helper + server-side guards
  - [ ] 04C — Redirect callback per role
- [ ] TASK-05 — Middleware host routing + superadmin lock
  - [ ] 05A — Detect host and path; lock /resto-admin to platform
  - [ ] 05B — Add matcher for all paths
  - [ ] 05C — Tests cover redirection behaviour
- [ ] TASK-06 — Admin (site) + Superadmin dashboards
  - [ ] 06A — Superadmin list: Sites, Domains, Users
  - [ ] 06B — Per-site Admin shell with nav
  - [ ] 06C — Access tests (RBAC)
- [ ] TASK-07 — Create Site wizard
  - [ ] 07A — Basics → name, host label, business type
  - [ ] 07B — Owner invite (email) optional
  - [ ] 07C — Seed Hours/Events/Specials defaults
- [ ] TASK-08 — Vercel Domain add/verify API
  - [ ] 08A — Add domain via Vercel API if token provided
  - [ ] 08B — Verify endpoint + polling/backoff
  - [ ] 08C — Hourly cron for PENDING
- [x] TASK-09 — Per-host SEO (sitemap/robots/JSON-LD)
  - [ ] 09A — Dynamic sitemap per host (App Router)
  - [ ] 09B — robots.txt per host with disallow rules for /admin,/resto-admin
  - [ ] 09C — Inject LocalBusiness/Menu/Event JSON-LD
  - [ ] 09D — Lighthouse SEO ≥ 90 on tenant + platform
- [ ] TASK-10 — SPA home sections + routes
  - [ ] 10A — Home sections composed, fast LCP
  - [ ] 10B — Routes: /menu /specials /events /reviews /about /visit
  - [ ] 10C — Prefetch & image optimization
- [ ] TASK-11 — Accessibility toolbar + a11y passes
  - [ ] 11A — Toolbar with persisted preferences & aria-live
  - [ ] 11B — Skip links, focus rings, keyboard traps eliminated
  - [ ] 11C — Axe & Lighthouse a11y thresholds
- [ ] TASK-12 — Footer/header Login + role redirects
  - [ ] 12A — Footer button + optional header link
  - [ ] 12B — Cross-host login redirect logic validated
- [ ] TASK-13 — Health cards & scheduled pings
  - [ ] 13A — Ping job writes HealthPing rows
  - [ ] 13B — Cards query recent metrics
  - [ ] 13C — Error states & empty states handled
- [ ] TASK-14 — Events defaults (Mon poker, Thu bingo, Sun potluck)
  - [ ] 14A — Seed: Poker Mon 7 PM; Bingo Thu 7 PM; Broncos Potluck Sun kickoff
  - [ ] 14B — Render on /events with JSON-LD Event
  - [ ] 14C — Admin edit + publish/unpublish
- [ ] TASK-15 — 30 rotating specials in CMS
  - [ ] 15A — Seed 30 named specials with categories/prices
  - [ ] 15B — Admin CRUD with schedule toggle
  - [ ] 15C — Public listing + mini section
- [ ] TASK-16 — Images alt text wired
  - [ ] 16A — Map filenames → fixed alt per runbook list
  - [ ] 16B — Fallback alt rules for new media
  - [ ] 16C — Axe pass for images
- [ ] TASK-17 — Playwright + Axe + Lighthouse CI
  - [ ] 17A — Playwright smoke flows (public + admin)
  - [ ] 17B — Axe integration for a11y assertions
  - [ ] 17C — Lighthouse CI with budgets/thresholds
- [ ] TASK-18 — Monaghans domain attached & verified
  - [ ] 18A — Add domain via UI/API
  - [ ] 18B — DNS records correct (CNAME/A/ALIAS)
  - [ ] 18C — Verify + smoke test routes
- [ ] TASK-19 — AI intake wizard (tailored Q&A by business type)
  - [ ] 19A — Blueprint: type-specific question sets (dive bar/café/fine dining)
  - [ ] 19B — Prompt packs + slot map (hours, parking, TVs, reservations)
  - [ ] 19C — UX: chat → preview site → accept → seed
  - [ ] 19D — PII/profanity guardrails + follow-up flags
  - [ ] 19E — Fixtures & tests for nonsense input
- [ ] TASK-20 — Menu parser (PDF/image → structured Specials/Menu rows)
  - [ ] 20A — OCR pipeline + price/emoji scrub
  - [ ] 20B — Section classifier (Breakfast/Lunch/Dinner/Drinks)
  - [ ] 20C — Owner review + approval flow
  - [ ] 20D — Unit tests on 5 menus with accuracy target
- [ ] TASK-21 — DNS auto-provisioner (hide steps when Vercel API succeeds)
  - [ ] 21A — ENV checks VERCEL_* present; helpful errors
  - [ ] 21B — Add domain + store verification TXT if needed
  - [ ] 21C — Verify loop with exponential backoff
  - [ ] 21D — Failure telemetry + surfaced messages
- [ ] TASK-22 — Template variants (dive bar / fine dining / café)
  - [ ] 22A — Variant tokens (type scale/spacing/contrast)
  - [ ] 22B — Hero/Today presets per variant
  - [ ] 22C — JSON-LD subtype presets
  - [ ] 22D — Playwright snapshots per variant
- [ ] TASK-23 — Owner self-serve edits (hours, specials, events) with autosave & audit
  - [ ] 23A — RBAC guard + optimistic autosave
  - [ ] 23B — AuditLog on every change
  - [ ] 23C — Undo soft-revert within 20 minutes
- [ ] TASK-24 — Backup & rollback (DB + media to object storage)
  - [ ] 24A — Nightly cron → S3/Backblaze
  - [ ] 24B — Restore latest/by date command
  - [ ] 24C — Disaster drill script + doc
- [ ] TASK-25 — Basic analytics (pageviews, CTA clicks, top specials)
  - [ ] 25A — Edge/server events + beacon
  - [ ] 25B — Dashboard filters + date ranges
  - [ ] 25C — Privacy + bot filtering
- [ ] TASK-26 — Billing stub (Stripe subscription: base + add-ons)
  - [ ] 26A — Create Stripe products/prices
  - [ ] 26B — Webhook handler (invoice.paid/failed, customer.deleted)
  - [ ] 26C — Grace period + locked UI state
