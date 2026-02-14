# Technology Stack

Concrete technology choices for the **Simvado platform**, with rationale for each decision.

**Important:** This document covers the platform only. Simulations are built in external game engines (Unreal Engine, Unity, etc.) and are NOT part of the platform codebase. Game engines connect to the platform via the Game Engine API.

## Platform Frontend

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Next.js 15 (App Router)** | Full-stack React framework | SSR for marketing/SEO, server components for dashboard, API routes for backend |
| **React 19** | UI library | Component model, ecosystem, team familiarity |
| **Tailwind CSS** | Styling | Rapid UI development, consistent design system |
| **React Query (TanStack)** | Server state management | Caching, loading states, API data synchronization |

**Note:** The platform does NOT include a simulation player. Simulations run in external game engines. The platform provides catalog browsing, analytics dashboards, AI debriefs, and enterprise management.

## Platform Backend

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Node.js (via Next.js API routes)** | API server | Unified deployment with frontend, TypeScript end-to-end |
| **PostgreSQL** | Primary database | Relational data (users, orgs, sessions), JSONB for game event data and scores |
| **Prisma** | ORM | Type-safe queries, migrations, schema-as-code |
| **Redis** | Cache + real-time | Session cache, rate limiting |
| **Stripe** | Payments | Subscriptions, invoicing, Stripe Connect for Phase 3 marketplace |

## Game Engine Integration

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Game Engine API** | REST API for game engines | Session creation, event reporting, score submission, completion signaling |
| **API Key Authentication** | SHA-256 hashed keys | Separate from Clerk JWT — game engines authenticate with API keys, not user sessions |
| **GameEvent model** | Generic event storage | Flexible JSONB event data supports any game engine's data format |

### Supported Game Engines

| Engine | Status | Integration Method |
|--------|--------|-------------------|
| **Unreal Engine** | Phase 1 (flagship) | HTTP REST calls from Unreal to Simvado API |
| **Unity** | Phase 1 | HTTP REST calls from Unity to Simvado API |
| **Web-based** | Phase 2 | Browser-based games calling Simvado API via JavaScript |
| **Custom** | Phase 3 | Any engine implementing the API contract |

### API Endpoints for Game Engines

| Route | Purpose |
|-------|---------|
| `POST /api/game/sessions` | Create a session |
| `GET /api/game/sessions/:id` | Read session state |
| `POST /api/game/sessions/:id/events` | Report events (decisions, milestones, scores) |
| `POST /api/game/sessions/:id/complete` | Signal completion + final scores |

## Authentication

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Clerk** | Auth provider (platform users) | Email/password, OAuth (Google, Microsoft), JWT, role-based access, enterprise SSO (SAML) ready |
| **API Keys** | Auth for game engines | SHA-256 hashed keys with scopes, expiration, and per-simulation access control |

Clerk handles: registration, login, session management, org/team structure, and webhook events for user lifecycle.

## AI Layer

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Claude API (Anthropic)** | Primary AI engine | Debrief generation, coaching analysis, enterprise report generation |

**Architecture principle:** AI handles generative tasks on the platform side (debriefs, coaching, reports). Gameplay logic, scoring, and decision branching are handled by the game engine — no LLM in the gameplay loop.

### AI Usage

| Feature | AI Model | When | Latency Requirement |
|---------|----------|------|-------------------|
| Debrief Generator | Claude Sonnet | After session completion | < 10 seconds |
| Enterprise Analytics | Claude | On-demand (reports) | < 30 seconds |

## Infrastructure & Deployment

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Hostinger VPS** | Application hosting | Docker-based deployment, cost-effective for Phase 1 |
| **Docker + Docker Compose** | Container orchestration | Consistent deployments with Traefik reverse proxy |
| **Traefik** | Reverse proxy + SSL | Automatic HTTPS via Let's Encrypt, domain routing |
| **GitHub Actions** | CI/CD pipeline | Lint → Build → Deploy on push to main |
| **GitHub Container Registry** | Docker image storage | Private image hosting for deployment |
| **GitHub** | Source control | Repository, PRs, issue tracking |

## Automation

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **n8n** | Workflow automation | Onboarding email sequences, enterprise report generation, Slack notifications, webhook processing |

### n8n Automation Workflows (Phase 1)

1. **User onboarding** — welcome email, demo assignment
2. **Simulation completion** — trigger debrief generation, update analytics
3. **Enterprise alerts** — weekly progress digest to admin
4. **Billing events** — Stripe webhook processing, failed payment recovery
5. **Content publish** — notify subscribers of new simulation releases

## Development Tooling

| Tool | Purpose |
|------|---------|
| TypeScript | End-to-end type safety (frontend + backend) |
| ESLint + Prettier | Code quality and formatting |
| Vitest | Unit and integration testing |
| Playwright | E2E testing for platform flows |
