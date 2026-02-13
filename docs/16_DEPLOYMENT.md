# Deployment

CI/CD pipeline, environments, and infrastructure configuration for the Simvado platform.

## Environments

| Environment | Purpose | URL | Deployment Trigger |
|-------------|---------|-----|-------------------|
| **Local** | Development | `localhost:3000` | Manual (`npm run dev`) |
| **Preview** | PR review | `*.vercel.app` (auto-generated) | Every pull request |
| **Staging** | Pre-production testing | `staging.simvado.com` | Merge to `develop` branch |
| **Production** | Live platform | `app.simvado.com` | Merge to `main` branch |

## Infrastructure Map

```
┌──────────────────────────────────────────────────────────┐
│ Vercel                                                    │
│ ├── Next.js App (Frontend + API Routes)                  │
│ ├── Edge Functions (middleware, auth checks)              │
│ └── Preview Deployments (per PR)                         │
├──────────────────────────────────────────────────────────┤
│ Railway                                                   │
│ ├── PostgreSQL (primary database)                        │
│ └── Redis (cache + session store)                        │
├──────────────────────────────────────────────────────────┤
│ Cloudflare                                                │
│ ├── R2 (object storage — video, images, audio)           │
│ ├── CDN (edge delivery for media assets)                 │
│ └── DNS (domain management)                              │
├──────────────────────────────────────────────────────────┤
│ External Services                                         │
│ ├── Clerk (authentication)                               │
│ ├── Stripe (payments)                                    │
│ ├── Anthropic API (Claude — AI agents)                   │
│ └── n8n (workflow automation — self-hosted or cloud)     │
└──────────────────────────────────────────────────────────┘
```

## CI/CD Pipeline (GitHub Actions)

### On Pull Request

```yaml
name: PR Check
on: pull_request

jobs:
  lint:
    - Checkout code
    - Install dependencies (npm ci)
    - Run ESLint
    - Run Prettier check

  typecheck:
    - Run TypeScript compiler (tsc --noEmit)

  test:
    - Run Vitest (unit + integration tests)
    - Upload coverage report

  build:
    - Run Next.js build (next build)
    - Verify no build errors

  preview:
    - Vercel auto-deploys preview URL
    - Comment preview URL on PR
```

### On Merge to develop (Staging)

```yaml
name: Deploy Staging
on:
  push:
    branches: [develop]

jobs:
  deploy:
    - Run full test suite
    - Run database migrations (prisma migrate deploy)
    - Deploy to Vercel staging environment
    - Run Playwright E2E tests against staging
    - Notify team on Slack (via n8n)
```

### On Merge to main (Production)

```yaml
name: Deploy Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    - Run full test suite
    - Run database migrations (prisma migrate deploy)
    - Deploy to Vercel production
    - Run smoke tests against production
    - Notify team on Slack (via n8n)
    - Tag release in Git
```

## Database Migrations

Using Prisma Migrate:

```bash
# Create new migration
npx prisma migrate dev --name add_feature_x

# Apply migrations to staging/production
npx prisma migrate deploy

# Generate Prisma client after schema changes
npx prisma generate
```

**Migration rules:**
- All migrations are version-controlled in `prisma/migrations/`
- Never edit applied migrations — create new ones
- Test migrations against a copy of production data before applying
- Rollback strategy: create a reverse migration (Prisma doesn't auto-rollback)

## Environment Variables

| Variable | Service | Where Used |
|----------|---------|-----------|
| `DATABASE_URL` | Railway PostgreSQL | Prisma, API routes |
| `REDIS_URL` | Railway Redis | Cache, rate limiting |
| `CLERK_SECRET_KEY` | Clerk | Server-side auth |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Client-side auth |
| `CLERK_WEBHOOK_SECRET` | Clerk | Webhook verification |
| `STRIPE_SECRET_KEY` | Stripe | Server-side billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Client-side checkout |
| `ANTHROPIC_API_KEY` | Anthropic | Claude AI agents |
| `CLOUDFLARE_R2_ACCESS_KEY` | Cloudflare R2 | Media upload |
| `CLOUDFLARE_R2_SECRET_KEY` | Cloudflare R2 | Media upload |
| `CLOUDFLARE_R2_BUCKET` | Cloudflare R2 | Bucket name |
| `CLOUDFLARE_R2_ENDPOINT` | Cloudflare R2 | S3-compatible endpoint |
| `N8N_WEBHOOK_URL` | n8n | Triggering automations |

**Security rules:**
- Never commit `.env` files
- Use Vercel Environment Variables for staging/production
- Use Railway's built-in env var management for database URLs
- Rotate API keys quarterly

## Monitoring & Observability

| Concern | Tool | Phase |
|---------|------|-------|
| Error tracking | Vercel Analytics + Sentry (if needed) | Phase 1 |
| Performance monitoring | Vercel Speed Insights | Phase 1 |
| Uptime monitoring | Better Uptime or similar | Phase 1 |
| Database monitoring | Railway dashboard | Phase 1 |
| AI cost tracking | Anthropic usage dashboard | Phase 1 |
| Application logs | Vercel Logs | Phase 1 |
| Custom metrics | PostHog (product analytics) | Phase 2 |

## Domain & DNS

| Domain | Purpose | Provider |
|--------|---------|---------|
| `simvado.com` | Marketing site | Cloudflare DNS |
| `app.simvado.com` | Platform (Next.js app) | Vercel + Cloudflare DNS |
| `cdn.simvado.com` | Media assets | Cloudflare R2 + CDN |
| `staging.simvado.com` | Staging environment | Vercel + Cloudflare DNS |

## Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Merchously/Simvado.git
cd Simvado

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in local dev values

# 4. Start database (Docker)
docker compose up -d postgres redis

# 5. Run migrations
npx prisma migrate dev

# 6. Start development server
npm run dev
```

## Docker Compose (Local Dev)

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: simvado
      POSTGRES_USER: simvado
      POSTGRES_PASSWORD: localdev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```
