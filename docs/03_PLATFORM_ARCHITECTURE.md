# Platform Architecture

## User Types

| Role | Description | Phase |
|------|-------------|-------|
| **Individual Professional** | Solo subscriber exploring simulations | Phase 1 |
| **Enterprise Admin** | Manages org seats, assigns simulations, views analytics | Phase 2 |
| **Enterprise Participant** | Employee assigned simulations by their org | Phase 2 |
| **Studio Creator** | Third-party simulation author | Phase 3 |
| **Platform Admin** | Simvado internal — content management, support, analytics | Phase 1 |

## Core Platform Modules

### Phase 1 Modules

| Module | Purpose | Key Features |
|--------|---------|-------------|
| **Auth & Identity** | User registration, login, role-based access | Email/password, OAuth (Google, Microsoft), JWT sessions |
| **Simulation Player Engine** | Renders and runs simulations | Decision tree traversal, media playback, state management, scoring |
| **Content Management System** | Internal tool for managing simulation content | CRUD for simulations, version control, publish/unpublish |
| **User Dashboard** | Personal progress and history | Completed simulations, scores, skill radar chart |
| **Subscription & Billing** | Payment processing | Stripe integration, plan management, invoicing |
| **Media Pipeline** | Asset storage and delivery | Video/image upload, CDN delivery, transcoding |

### Phase 2 Modules

| Module | Purpose | Key Features |
|--------|---------|-------------|
| **Enterprise Dashboard** | Organization-level management | Seat allocation, department segmentation, bulk assignment |
| **Enterprise Analytics** | Performance insights across organization | Aggregate scores, risk heatmaps, exportable reports (PDF/CSV) |
| **Notification System** | Alerts and communications | Assignment notifications, completion reminders, admin alerts |
| **AI Scenario Engine** | Dynamic simulation adaptation | Real-time difficulty adjustment, personalized branching |

### Phase 3 Modules

| Module | Purpose | Key Features |
|--------|---------|-------------|
| **Studio SDK & Authoring Tool** | External simulation creation | Template library, decision tree builder, scoring configurator |
| **Marketplace** | Discovery and distribution | Search, categories, ratings, featured content |
| **API Gateway** | Integration layer for third parties | REST API, webhooks, partner authentication |
| **Revenue Share Engine** | Automated creator payments | Usage tracking, split calculation, payout via Stripe Connect |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Client (Next.js)                   │
│          Browser / Tablet (16:9 optimized)           │
├─────────────────────────────────────────────────────┤
│                 API Layer (Node.js)                   │
│     REST endpoints + WebSocket (real-time sims)      │
├──────────┬──────────┬──────────┬────────────────────┤
│   Auth   │ Sim      │ CMS      │ Analytics          │
│ (Clerk)  │ Engine   │          │ Engine             │
├──────────┴──────────┴──────────┴────────────────────┤
│              Database (PostgreSQL)                    │
│              Cache (Redis)                            │
│              File Storage (S3 / Cloudflare R2)       │
├─────────────────────────────────────────────────────┤
│          AI Layer (Claude API + Custom Logic)         │
├─────────────────────────────────────────────────────┤
│     Automation (n8n) — onboarding, alerts, reports   │
└─────────────────────────────────────────────────────┘
```

## Enterprise Controls

- Seat allocation and license management
- Department and team segmentation
- Simulation assignment and scheduling
- Progress tracking per participant
- Risk and competency analytics
- Exportable performance reports (PDF, CSV)
- SSO integration (SAML/OIDC) for enterprise auth
