# Platform Architecture

## User Types

| Role | Description | Phase |
|------|-------------|-------|
| **Individual Professional** | Solo subscriber exploring simulations | Phase 1 |
| **Enterprise Admin** | Manages org seats, assigns simulations, views analytics | Phase 2 |
| **Enterprise Participant** | Employee assigned simulations by their org | Phase 2 |
| **Studio Creator** | Third-party simulation author (external game engine) | Phase 3 |
| **Platform Admin** | Simvado internal — content management, support, analytics | Phase 1 |

## Core Platform Modules

**Important:** The platform does NOT render or run simulations. Simulations are built in external game engines (Unreal, Unity, etc.) and connect via the Game Engine API. The platform provides catalog, analytics, AI debriefs, and management.

### Phase 1 Modules

| Module | Purpose | Key Features |
|--------|---------|-------------|
| **Auth & Identity** | User registration, login, role-based access | Email/password, OAuth (Google, Microsoft), JWT sessions |
| **Game Engine Integration API** | Connects external game engines to the platform | Session creation, event reporting, score submission, completion signaling (API key auth) |
| **Simulation Catalog** | Discover and browse simulations | Search, filter by category/skill/difficulty, launch links |
| **Analytics & Debriefs** | Post-session performance analysis | Multi-axis scoring, AI-generated coaching debriefs, peer comparison |
| **User Dashboard** | Personal progress and history | Completed simulations, scores, session history |
| **Subscription & Billing** | Payment processing | Stripe integration, plan management, invoicing |
| **Content Management System** | Internal tool for managing simulation metadata | CRUD for simulations, module configuration, API key management |

### Phase 2 Modules

| Module | Purpose | Key Features |
|--------|---------|-------------|
| **Enterprise Dashboard** | Organization-level management | Seat allocation, department segmentation, bulk assignment |
| **Enterprise Analytics** | Performance insights across organization | Aggregate scores, risk heatmaps, exportable reports (PDF/CSV) |
| **Notification System** | Alerts and communications | Assignment notifications, completion reminders, admin alerts |

### Phase 3 Modules

| Module | Purpose | Key Features |
|--------|---------|-------------|
| **Game Engine SDKs** | Engine-specific integration libraries | Unreal SDK, Unity SDK wrapping the REST API |
| **Developer Portal** | External studio onboarding | API docs, SDK downloads, integration guides, sandbox |
| **Marketplace** | Discovery and distribution | Search, categories, ratings, featured content, studio profiles |
| **Revenue Share Engine** | Automated creator payments | Usage tracking, split calculation, payout via Stripe Connect |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│       Game Engines (Unreal, Unity, Custom)               │
│     (Build and run simulations externally)                │
│                                                          │
│  Reports events via ──→ Game Engine API (REST + API Key) │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Simvado Platform (Next.js)                 │
│           Browser-based web application                  │
├──────────┬──────────┬──────────┬────────────────────────┤
│   Auth   │ Catalog  │ Analytics│ Enterprise             │
│ (Clerk)  │ & Launch │ & Debrief│ Management             │
├──────────┴──────────┴──────────┴────────────────────────┤
│              Database (PostgreSQL)                        │
│              Cache (Redis)                                │
│              File Storage (Cloudflare R2 — planned)      │
├─────────────────────────────────────────────────────────┤
│          AI Layer (Claude API — debriefs & reports)       │
├─────────────────────────────────────────────────────────┤
│     Automation (n8n) — onboarding, alerts, reports       │
└─────────────────────────────────────────────────────────┘
```

## Enterprise Controls

- Seat allocation and license management
- Department and team segmentation
- Simulation assignment and scheduling
- Progress tracking per participant
- Risk and competency analytics
- Exportable performance reports (PDF, CSV)
- SSO integration (SAML/OIDC) for enterprise auth
