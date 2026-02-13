# Content Studio Model

## Phase 1 — Simvado Studio (Internal)

All simulation content is designed, built, and maintained by the internal Simvado team.

### Authoring Pipeline

```
1. Research & Brief
   └─ Industry research, SME interviews, scenario identification

2. Narrative Design
   └─ Story arc, characters, setting, stakes
   └─ Output: Narrative document (Markdown)

3. Decision Tree Architecture
   └─ Branch mapping, consequence logic, dead-end prevention
   └─ Output: Decision tree (JSON per 15_SIMULATION_SCHEMA.md)

4. Stakeholder & Character Design
   └─ NPC profiles, motivations, dialogue patterns
   └─ Output: Character profiles (JSON)

5. Scoring Rubric Design
   └─ 5-axis scoring calibration, weight assignment
   └─ Output: Scoring config (JSON)

6. Media Production
   └─ Video scenes, character portraits, environment art, audio
   └─ Output: Media assets (uploaded to CDN)

7. AI Prompt Engineering
   └─ Reaction prompts, debrief generation prompts, adaptive logic
   └─ Output: Prompt templates (stored in CMS)

8. Integration & QA
   └─ End-to-end testing, scoring validation, edge case review
   └─ Output: Staged simulation ready for publish

9. Publish & Monitor
   └─ Release to production, track engagement and completion metrics
```

### Team Roles (Phase 1)

| Role | Responsibility |
|------|---------------|
| Simulation Designer | Narrative, decision trees, scoring logic |
| AI Engineer | Prompt engineering, reaction engine, adaptive logic |
| Media Producer | Video, art, audio assets |
| QA Tester | End-to-end simulation testing |
| Product Lead | Prioritization, review, publish approval |

## Phase 3 — External Studio Model (Marketplace)

Third-party studios can create and publish simulations on the Simvado platform.

### What Simvado Provides to Studios

- **Studio SDK** — authoring tools, decision tree builder, scoring configurator
- **Template Library** — pre-built simulation templates for common formats
- **Simulation Engine** — studios build content, Simvado handles rendering and delivery
- **Distribution** — marketplace listing, search, recommendations
- **Analytics** — usage data, completion rates, revenue reporting
- **Payments** — automated 50/50 revenue share via Stripe Connect

### Studio Submission Pipeline

```
Submit → Review (Simvado QA) → Revision (if needed) → Approve → Publish
```

### Quality Standards for External Studios

- All simulations must include: narrative context, minimum 3 decision nodes, scoring rubric, and debrief
- Content must meet Simvado editorial guidelines (no offensive content, factual accuracy)
- Simulations must pass automated schema validation (see 15_SIMULATION_SCHEMA.md)
- Performance benchmarked: must load and run within acceptable latency thresholds

### Simvado's Role Evolves

```
Phase 1: Studio (we make the content)
Phase 2: Studio + Platform (we make content and run the platform)
Phase 3: Platform + Marketplace (we run the platform, studios make content too)
Phase 4: Global Distribution Engine (platform at scale across industries)
```
