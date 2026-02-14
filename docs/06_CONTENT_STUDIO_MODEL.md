# Content Studio Model

## Phase 1 — Simvado Studio (Internal)

All simulation content is designed, built, and maintained by the internal Simvado team using professional game engines.

### Production Pipeline

```
1. Research & Brief
   └─ Industry research, SME interviews, scenario identification

2. Narrative Design
   └─ Story arc, characters, setting, stakes
   └─ Output: Narrative document (Markdown)

3. Game Design & Decision Architecture
   └─ Branch mapping, consequence logic, gameplay mechanics
   └─ Output: Game design document

4. Stakeholder & Character Design
   └─ NPC profiles, motivations, dialogue patterns, 3D character models
   └─ Output: Character profiles + 3D assets

5. Scoring Rubric Design
   └─ Multi-axis scoring calibration, weight assignment
   └─ Output: Scoring config (JSON, stored on platform)

6. Game Engine Development
   └─ Build simulation in Unreal Engine (or Unity)
   └─ 3D environments, character animation, gameplay logic
   └─ Integrate Simvado API SDK for event reporting
   └─ Output: Playable build

7. Platform Integration
   └─ Connect game engine to Simvado via Game Engine API
   └─ Map game events to platform scoring dimensions
   └─ Configure session creation and completion flows
   └─ Output: Fully integrated simulation

8. AI Debrief Engineering
   └─ Debrief generation prompts, coaching logic
   └─ Output: Prompt templates (stored on platform)

9. QA & Testing
   └─ End-to-end testing, scoring validation, API integration testing
   └─ Output: Tested simulation ready for publish

10. Publish & Monitor
    └─ Release to production catalog, track engagement and completion metrics
```

### Team Roles (Phase 1)

| Role | Responsibility |
|------|---------------|
| Simulation Designer | Narrative, decision architecture, scoring logic |
| Game Developer | Unreal/Unity development, 3D environments, gameplay |
| AI Engineer | Debrief prompts, coaching logic, platform AI features |
| 3D Artist | Character models, environments, visual assets |
| Audio Designer | Voice acting, ambient sound, music |
| QA Tester | End-to-end simulation + API integration testing |
| Product Lead | Prioritization, review, publish approval |

## Phase 3 — External Studio Model (Marketplace)

Third-party studios can create and publish simulations on the Simvado platform using any supported game engine.

### What Simvado Provides to Studios

- **Game Engine API & SDK** — REST API and engine-specific SDKs (Unreal, Unity) for session management, event reporting, and score submission
- **Platform Integration Guide** — documentation for connecting any game engine to Simvado
- **Distribution** — marketplace listing, search, recommendations, user base
- **Analytics** — usage data, completion rates, score analytics, revenue reporting
- **AI Debriefs** — platform-generated coaching debriefs from game event data
- **Payments** — automated 50/50 revenue share via Stripe Connect

### Studio Integration Flow

```
Build Game → Integrate Simvado API → Submit for Review → Simvado QA → Approve → Publish
```

### Quality Standards for External Studios

- All simulations must integrate with the Game Engine API (sessions, events, completion)
- Scoring data must map to the platform's configurable scoring dimensions
- Content must meet Simvado editorial guidelines (no offensive content, factual accuracy)
- Simulations must pass API integration testing and event schema validation
- Performance benchmarked: reasonable load times and responsive gameplay

### Simvado's Role Evolves

```
Phase 1: Studio (we build simulations in Unreal + run the platform)
Phase 2: Studio + Platform (we build more simulations, expand platform features)
Phase 3: Platform + Marketplace (we run the platform, studios build simulations too)
Phase 4: Global Distribution Engine (platform at scale across industries and engines)
```
