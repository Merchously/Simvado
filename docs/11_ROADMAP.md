# Roadmap

All phases align with the Canonical Phase Definitions in 00_README.md.

## Phase 1 — Foundation

**Goal:** Launch Boardroom Under Pressure and validate product-market fit.

| Milestone | Deliverable | Dependencies |
|-----------|------------|--------------|
| **M1.1** Platform scaffold | Next.js app, auth (Clerk), database (PostgreSQL + Prisma), basic UI shell | — |
| **M1.2** Simulation Player Engine | Branching video player, decision overlays, timer, state management | M1.1 |
| **M1.3** Module 1: Activist Investor Showdown | Full playable module with video, decisions, scoring, debrief | M1.2 |
| **M1.4** Scoring & Debrief System | 5-axis scoring engine, AI debrief generation (Claude), scorecard UI | M1.2 |
| **M1.5** User Dashboard | Progress tracking, simulation history, score visualization | M1.1 |
| **M1.6** Subscription & Billing | Stripe integration, free/pro tiers, billing portal | M1.1 |
| **M1.7** Modules 2–3 | Insider Warning + Crisis Communication Under Fire | M1.3 |
| **M1.8** CMS (Internal) | Simulation content management for internal team | M1.2 |
| **M1.9** Free Demo Launch | Module 1 Act 1 available as free trial | M1.3, M1.6 |
| **M1.10** Pilot Enterprise Sales | 3–5 enterprise pilot customers onboarded | M1.9 |

**Success criteria:** 50+ individual signups, 3+ enterprise pilots, >70% simulation completion rate, positive debrief feedback.

## Phase 2 — Enterprise Scale

**Goal:** Build enterprise features and expand simulation library.

| Milestone | Deliverable | Dependencies |
|-----------|------------|--------------|
| **M2.1** Enterprise Dashboard | Seat management, department segmentation, bulk assignment | Phase 1 |
| **M2.2** Enterprise Analytics | Aggregate scoring, risk heatmaps, exportable reports | M2.1 |
| **M2.3** SSO Integration | SAML/OIDC for enterprise auth (via Clerk) | M2.1 |
| **M2.4** Notification System | Email notifications for assignments, completions, reminders | M2.1 |
| **M2.5** AI Adaptive Engine | Claude-powered dynamic difficulty and path adjustment | Phase 1 |
| **M2.6** Modules 4–7 | ESG Backlash, CEO Succession, Cybersecurity Breach, Regulatory Investigation | Phase 1 |
| **M2.7** n8n Automation Suite | Onboarding flows, weekly digests, billing webhooks, publish notifications | M2.1 |

**Success criteria:** 10+ enterprise customers, $250K+ ARR, <5% churn, enterprise NPS > 40.

## Phase 3 — Marketplace

**Goal:** Open platform to third-party simulation studios.

| Milestone | Deliverable | Dependencies |
|-----------|------------|--------------|
| **M3.1** Studio SDK | Authoring tools, decision tree builder, scoring configurator | Phase 2 |
| **M3.2** Submission & Review Pipeline | Studio submission, Simvado QA review, publish workflow | M3.1 |
| **M3.3** Marketplace UI | Search, categories, ratings, featured content | M3.1 |
| **M3.4** Revenue Share Engine | Stripe Connect payouts, usage tracking, split calculation | M3.3 |
| **M3.5** API Gateway | Public API for studio integrations, webhooks | M3.1 |

**Success criteria:** 10+ external studios, 25+ marketplace simulations, marketplace revenue > 20% of total.

## Phase 4 — Global Expansion

**Goal:** Scale across industries and languages worldwide.

| Milestone | Deliverable | Dependencies |
|-----------|------------|--------------|
| **M4.1** Multi-language Support | i18n framework, translated UI, localized content | Phase 3 |
| **M4.2** Industry Verticals | Healthcare, Government, Military, Legal, Sports simulation libraries | Phase 3 |
| **M4.3** Global CDN Optimization | Regional edge caching for video delivery | Phase 3 |
| **M4.4** Enterprise Global Licensing | Multi-region compliance, data residency | M4.1 |

**Success criteria:** Available in 5+ languages, 100+ simulations across 6+ industries, global enterprise customers.
