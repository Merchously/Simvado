# Product Architecture

Simvado is structured like a streaming platform — a content library where each item is an interactive simulation built in a professional game engine rather than a video.

## Platform vs Game Engine Responsibilities

Simvado is the **platform** (like Netflix). Simulations are the **content** (like movies). They are built in external game engines (Unreal, Unity, etc.) and connect to Simvado via APIs.

| Responsibility | Owner | Details |
|---------------|-------|---------|
| **User authentication & authorization** | Platform (Simvado) | Clerk-based auth, subscription checks, role management |
| **Simulation catalog & discovery** | Platform (Simvado) | Browse, filter, search simulations by category/skill/difficulty |
| **Simulation gameplay & rendering** | Game Engine (Unreal/Unity) | 3D environments, character interactions, real-time gameplay |
| **Decision logic & branching** | Game Engine | Decision trees, branching paths, NPC behavior |
| **Score calculation** | Hybrid | Game engine calculates and reports scores; platform can verify/recalculate |
| **Event reporting** | Game Engine → Platform API | Real-time events (decisions, milestones, score updates) posted via API |
| **Session management** | Hybrid | Platform creates sessions; game engine tracks gameplay state |
| **Analytics & dashboards** | Platform (Simvado) | Score visualization, peer comparison, progress tracking |
| **AI debriefs** | Platform (Simvado) | Claude-generated coaching analysis from game event data |
| **Enterprise management** | Platform (Simvado) | Seat management, assignments, team analytics, SSO |
| **Payments & subscriptions** | Platform (Simvado) | Stripe integration, tier enforcement |

### Data Flow

```
Game Engine (Unreal/Unity)
    │
    ├── POST /api/game/sessions          → Create session
    ├── POST /api/game/sessions/:id/events  → Report events (decisions, milestones, scores)
    └── POST /api/game/sessions/:id/complete → Signal completion + final scores
                                                  ↓
                                          Platform generates AI debrief
                                                  ↓
                                          User reviews results on Simvado
```

## Content Categorization Model

### Primary Categories (by Industry)

- Executive Leadership
- Corporate Governance
- Healthcare
- Finance
- Education
- Government
- Sports Performance
- Legal
- Technology
- Public Relations
- Crisis Management
- Ethics & Compliance

### Secondary Filters

**Skill Type:**
- Strategic Thinking
- Crisis Response
- Ethical Judgment
- Communication & Negotiation
- Risk Management
- Stakeholder Management

**Difficulty Level:**
- Foundational — guided scenarios, clear feedback
- Intermediate — branching paths, moderate complexity
- Advanced — multi-stakeholder, time-pressured, ambiguous outcomes
- Executive — full-scenario, multi-round, AI-adaptive

### Simulation Formats

| Format | Engine | Description | Phase Available |
|--------|--------|-------------|-----------------|
| Unreal 3D | Unreal Engine | High-fidelity 3D cinematic simulations | Phase 1 |
| Unity 3D | Unity | Cross-platform 3D simulations | Phase 1 |
| Web-based | Browser | Lightweight web-based interactive scenarios | Phase 2 |
| External Custom | Various | Third-party engine integrations via API | Phase 3 |

## Simulation Content Structure

Every simulation contains these components, split between the game engine and platform:

| Component | Description | Owner | Data Format |
|-----------|-------------|-------|-------------|
| **Narrative Context** | Background story, setting, and stakes | Game Engine | In-engine assets |
| **Stakeholder Map** | Characters, roles, motivations | Game Engine | In-engine + JSON metadata on platform |
| **Decision Points** | Branching choice nodes with consequences | Game Engine | In-engine logic, events reported to platform |
| **AI Reactions** | Dynamic NPC responses based on player choices | Game Engine | In-engine (can query platform AI if needed) |
| **Scorecard** | Multi-dimensional scoring across configurable axes | Hybrid | Game engine calculates, platform stores/displays |
| **Debrief** | Personalized analysis of decisions and outcomes | Platform | AI-generated from game event data |

## Content Lifecycle

```
Design → Build in Game Engine → Integrate with Simvado API → QA Test → Publish → Analytics → Iterate
```

Each simulation moves through this pipeline. In Phase 1, all simulations are built internally by Simvado using Unreal Engine. In Phase 3, external studios use the same API integration to publish on the platform.
