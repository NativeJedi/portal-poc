---
title: Project Overview — raaS Customer Portal
tags:
  - overview
  - raas
  - portal
  - routes
  - rbac
created: 2026-10-22
status: draft
---

# Project Overview — raaS Customer Portal

What the portal does, who uses it and how its routes are organised. Architecture is covered separately in [[C4 Architecture - raaS Customer Portal]].

Source repository: `eric-raas-csw-customer-portal-ra`

- **rApp** — an application for the RAN (Radio Access Network): analytics, optimisation, diagnostics.
- **raaS** (Agentic rApp as a Service) — Ericsson's cloud platform that hosts rApps and sells them to mobile operators as a managed service, instead of shipping software the operator installs and runs itself.

---

## What the project does

The customer-facing web interface of the raaS platform. A single React 19 SPA that holds almost no business logic: it authenticates the user, checks which modules the user may open, fetches data from several backends and renders it.

| Module | What the user gets |
|---|---|
| App Hub | Catalogue of rApps. Currently one: Cell Anomaly Detector 5G (CAD), with four reports |
| Tenant Metrics | Pipeline health and data ingestion status, plus CAD and ADS (Application Data Service) metrics |
| Billing | Usage and cost for a billing period, broken down by use case |
| Documentation | Product documentation rendered from markdown bundled into the build |

All rendering happens in the browser. The build is tenant-agnostic: Cognito identifiers are read at startup from `config.json`, so one artifact serves any tenant.

---

## Users

Employees of the customer organisation (the *tenant*) who work with the network. Access is role-based: Cognito roles are translated to portal modules by `src/features/auth/model/permissions.ts`.

| Role | Billing | Tenant Metrics | App Hub | Documentation |
|---|---|---|---|---|
| `tenant_admin` | ✅ | ✅ | ✅ | ✅ |
| `tenant_use_case_viewer` | | | ✅ | ✅ |
| `tenant_metrics_viewer` | | ✅ | | ✅ |
| `tenant_billing_viewer` | ✅ | | | ✅ |
| no role | | | | ✅ |

- Documentation is granted to everyone: `resolveModules` adds it unconditionally.
- Home is available to every signed-in user.
- Internally the Tenant Metrics module is called `observability` (`ModuleId.Observability`).

---

## Route map

Route names are taken from `src/shared/routes/routes.ts`. In production every path sits under the API Gateway stage prefix `/V1`; in local dev there is no prefix.

> [!warning] README is outdated
> `README.md` and `doc/overview.md` list short paths (`/billing`, `/tenant-metrics`, `/docs`). The code uses the longer ones below.

### Public routes

No sign-in needed.

| Route | Purpose |
|---|---|
| `/login` | Sign-in form. A signed-in user is redirected to Home |
| `/change-password` | Set a new password on first login (Cognito returns `NEW_PASSWORD_REQUIRED`) |
| `/forgot-password` | Request a reset code |
| `/reset-password` | Enter the code and a new password, then return to `/login` |

### Protected routes — shell without sidebar

| Route | Purpose | Module required |
|---|---|---|
| `/` | Home: module cards grouped as "rApp as a Service", "Configuration", "Finance" | any |
| `/billing-portal` | Billing periods, summary cards, cost chart, use case table | `billing` |
| `/tenant-metrics-portal` | Date filter, ADS and CAD summary cards, chart of the selected metric | `observability` |

### Documentation — shell with sidebar

Module required: `documentation`.

| Route | Purpose |
|---|---|
| `/documentation-portal` | Documentation home |
| `/documentation-portal/cad/raas-summary` | CAD overview, its own page |
| `/documentation-portal/cad/*` | Pages rendered from markdown: `user-guide`, `technical-product-description`, `list-of-cm-parameters`, `list-of-counters`, `release-notes-1.0` |

### App Hub — shell with sidebar

Module required: `app-hub`.

| Route | Purpose |
|---|---|
| `/app-hub` | rApp catalogue, currently one card |
| `/app-hub/cad` | CAD dashboard: filter panel and four tabs — Class Summary, Analysis, KPIs, Inference |

### Fallback

Any other path (`*`) redirects to Home.

### How the guards behave

| Situation | Result |
|---|---|
| Not signed in, protected route | Redirect to `/login` |
| Signed in, module not granted | Redirect to `/` |
| Unknown path | Redirect to `/` |

All checks run in the browser. API Gateway does not distinguish these routes: it serves the same `index.html` for every client-side path.

---

## Observations

> [!note] Home cards are greyed out, not hidden
> `doc/auth.md` says Home "filters module cards". In the code, modules the user cannot open stay on screen as non-clickable grey cards.

> [!warning] Dead banner on Home
> Home shows "No applications available" when the user has no modules. Documentation is always granted, so the condition is never true for a signed-in user and the banner never appears.

---

## Sources

- `src/shared/routes/routes.ts`, `nav-routes.ts`, `app-hub-nav-routes.ts`, `docs-nav-routes.ts`
- `src/app/router.tsx`
- `src/features/auth/model/permissions.ts`
- `src/pages/home/ui/HomePage.tsx`, `src/pages/app-hub/ui/AppHubPage.tsx`
- `README.md`, `doc/overview.md`, `doc/auth.md`
