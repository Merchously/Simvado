# Deployment

CI/CD pipeline, environments, and infrastructure configuration for the Simvado platform.

## Environments

| Environment | Purpose | URL | Deployment Trigger |
|-------------|---------|-----|-------------------|
| **Local** | Development | `localhost:3000` | Manual (`npm run dev`) |
| **Production** | Live platform | `simvado.com` | Push to `main` branch |

## Infrastructure Map

```
┌──────────────────────────────────────────────────────────┐
│ Hostinger VPS (72.60.164.113)                             │
│ ├── Traefik (reverse proxy + Let's Encrypt SSL)          │
│ ├── Simvado Docker Project                               │
│ │   ├── app (ghcr.io/merchously/simvado:latest)          │
│ │   ├── postgres (PostgreSQL 16)                         │
│ │   └── redis (Redis 7 Alpine)                           │
│ ├── n8n (workflow automation)                            │
│ └── Other Docker projects                                │
├──────────────────────────────────────────────────────────┤
│ External Services                                         │
│ ├── Clerk (authentication)                               │
│ ├── Stripe (payments)                                    │
│ ├── Anthropic API (Claude — AI debriefs)                 │
│ └── Cloudflare (DNS)                                     │
├──────────────────────────────────────────────────────────┤
│ GitHub                                                    │
│ ├── Source code (github.com/Merchously/Simvado)          │
│ ├── GitHub Container Registry (Docker images)            │
│ └── GitHub Actions (CI/CD pipeline)                      │
└──────────────────────────────────────────────────────────┘
```

## CI/CD Pipeline (GitHub Actions)

### On Push to main (Production)

```yaml
name: Build & Deploy
on:
  push:
    branches: [main]

jobs:
  lint-typecheck:
    - Checkout code
    - Install dependencies (npm ci)
    - Generate Prisma client
    - Run ESLint
    - Run TypeScript compiler (tsc --noEmit)

  build-push (needs lint-typecheck):
    - Login to GitHub Container Registry
    - Build multi-stage Dockerfile
    - Push to ghcr.io/merchously/simvado:latest

  deploy (needs build-push):
    - Fetch current Docker config from Hostinger API
    - POST redeploy via Hostinger API (pulls latest image)
```

## Dockerfile (Multi-stage)

```
Stage 1 (deps):     npm ci + copy prisma schema
Stage 2 (builder):  prisma generate + next build (standalone output)
Stage 3 (runner):   Standalone Next.js output, non-root user, port 3000
                    Entrypoint: prisma db push + node server.js
```

## Docker Compose (Production — Hostinger)

The production Docker Compose is managed via the Hostinger Docker API. It includes:

- **app** — Next.js application with Traefik labels for HTTPS routing
- **postgres** — PostgreSQL 16 with persistent volume
- **redis** — Redis 7 Alpine with persistent volume

Traefik handles:
- Automatic HTTPS via Let's Encrypt
- Domain routing (simvado.com → app:3000)
- HTTP → HTTPS redirection

## Database Migrations

Using Prisma:

```bash
# Development: push schema changes directly
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate
```

**Production:** The Docker entrypoint runs `npx prisma db push` on each deployment, automatically applying schema changes.

## Environment Variables

| Variable | Service | Where Used |
|----------|---------|-----------|
| `DATABASE_URL` | PostgreSQL (Docker) | Prisma, API routes |
| `REDIS_URL` | Redis (Docker) | Cache, rate limiting |
| `CLERK_SECRET_KEY` | Clerk | Server-side auth |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Client-side auth |
| `CLERK_WEBHOOK_SECRET` | Clerk | Webhook verification |
| `STRIPE_SECRET_KEY` | Stripe | Server-side billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Client-side checkout |
| `ANTHROPIC_API_KEY` | Anthropic | Claude AI debriefs |
| `NEXT_PUBLIC_APP_URL` | App config | Base URL for the application |

**Security rules:**
- Never commit `.env` files
- Environment variables managed via Hostinger Docker API
- Rotate API keys quarterly

## GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `HOSTINGER_API_TOKEN` | VPS API authentication |
| `HOSTINGER_VM_ID` | VPS machine ID (1032520) |
| `GITHUB_TOKEN` | Auto-provided for GitHub Container Registry |

## Monitoring & Observability

| Concern | Tool | Phase |
|---------|------|-------|
| Error tracking | Application logs (Docker) | Phase 1 |
| Uptime monitoring | Better Uptime or similar | Phase 1 |
| AI cost tracking | Anthropic usage dashboard | Phase 1 |
| Custom metrics | PostHog (product analytics) | Phase 2 |

## Domain & DNS

| Domain | Purpose | Provider |
|--------|---------|---------|
| `simvado.com` | Platform (full application) | Cloudflare DNS → Hostinger VPS |

## Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Merchously/Simvado.git
cd Simvado

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in local dev values

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to local database
npx prisma db push

# 6. Start development server
npm run dev
```
