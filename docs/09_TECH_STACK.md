# Technology Stack

Concrete technology choices for the Simvado platform, with rationale for each decision.

## Frontend

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Next.js 14+ (App Router)** | Full-stack React framework | SSR for marketing/SEO, client-side for simulation player, API routes for backend |
| **React 18+** | UI library | Component model, ecosystem, team familiarity |
| **Tailwind CSS** | Styling | Rapid UI development, consistent design system |
| **GSAP** | Animation | Smooth transitions, cinematic UI effects in simulation player |
| **Zustand** | Client state management | Lightweight, handles simulation player state (current node, scores, timer) |
| **React Query (TanStack)** | Server state management | Caching, loading states, API data synchronization |

**Note:** Three.js is **not** needed for Phase 1. The flagship simulation is video-driven cinematic, not 3D-rendered. Three.js may be evaluated for Phase 2+ if multiplayer board simulations require spatial rendering.

## Backend

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Node.js (via Next.js API routes)** | API server | Unified deployment with frontend, TypeScript end-to-end |
| **PostgreSQL** | Primary database | Relational data (users, orgs, sessions), JSONB for simulation state |
| **Prisma** | ORM | Type-safe queries, migrations, schema-as-code |
| **Redis** | Cache + real-time | Session cache, simulation state for real-time scenarios, rate limiting |
| **Stripe** | Payments | Subscriptions, invoicing, Stripe Connect for Phase 3 marketplace |

## Authentication

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Clerk** | Auth provider | Email/password, OAuth (Google, Microsoft), JWT, role-based access, enterprise SSO (SAML) ready |

Clerk handles: registration, login, session management, org/team structure, and webhook events for user lifecycle. Avoids building custom auth.

## AI Layer

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Claude API (Anthropic)** | Primary AI engine | Dialogue generation, debrief generation, adaptive scenario logic |
| **Custom Decision Engine** | Deterministic game logic | Decision tree traversal, scoring calculation, state management — no AI needed |

**Architecture principle:** AI handles generative tasks (dialogue, debrief, adaptation). Deterministic tasks (scoring, branching, state) use structured JSON logic — no LLM in the scoring loop.

### AI Usage by Agent

| Agent | AI Model | Frequency | Latency Requirement |
|-------|----------|-----------|-------------------|
| Dialogue Writer | Claude | Per decision node | < 3 seconds |
| Debrief Generator | Claude | End of simulation | < 10 seconds |
| Adaptive Engine | Claude | Per decision round | < 5 seconds |
| Scoring Engine | None (deterministic) | Per decision node | < 100ms |
| Enterprise Analytics | Claude | On-demand (reports) | < 30 seconds |

## Media & Storage

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Cloudflare R2** | Object storage (video, images, audio) | S3-compatible, no egress fees, global CDN built-in |
| **Cloudflare CDN** | Asset delivery | Fast video streaming, edge caching |
| **FFmpeg (server-side)** | Video transcoding | Adaptive bitrate for different connections |

## Infrastructure & Deployment

| Technology | Purpose | Rationale |
|-----------|---------|-----------|
| **Vercel** | Frontend + API hosting | Native Next.js support, auto-scaling, preview deployments |
| **Railway** | Database hosting (PostgreSQL + Redis) | Simple managed databases, autoscaling |
| **Docker** | Local development + CI | Consistent dev environment, database containers |
| **GitHub Actions** | CI/CD pipeline | Automated testing, linting, deployment on push |
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
| Playwright | E2E testing for simulation player |
| Storybook | UI component development and documentation |
