# Product Architecture

Simvado is structured like a streaming platform — a content library where each item is an interactive simulation rather than a video.

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
- Foundational — single decision path, guided feedback
- Intermediate — branching paths, moderate complexity
- Advanced — multi-stakeholder, time-pressured, ambiguous outcomes
- Executive — full-scenario, multi-round, AI-adaptive

### Simulation Formats

| Format | Description | Phase Available |
|--------|-------------|-----------------|
| Branching Decision Narrative | Choose-your-own-adventure with scored outcomes | Phase 1 |
| Real-time Crisis Simulation | Time-pressured scenario with live consequences | Phase 1 |
| AI Adaptive Scenario | AI dynamically adjusts difficulty and narrative | Phase 2 |
| Multiplayer Board Simulation | Multi-player collaborative/competitive exercise | Phase 3 |

## Simulation Content Structure

Every simulation contains these components:

| Component | Description | Data Format |
|-----------|-------------|-------------|
| **Narrative Context** | Background story, setting, and stakes | Markdown + media assets |
| **Stakeholder Map** | Characters, roles, motivations, and relationships | JSON entity graph |
| **Decision Points** | Branching choice nodes with consequences | JSON decision tree |
| **AI Reaction Engine** | Dynamic NPC responses based on player choices | Prompt templates + context |
| **Scorecard** | Multi-dimensional scoring across 5 axes | JSON scoring rubric |
| **Debrief** | Personalized analysis of decisions and outcomes | AI-generated from session data |

## Content Lifecycle

```
Author → Review → QA Test → Stage → Publish → Analytics → Iterate
```

Each simulation moves through this pipeline. In Phase 1, all authoring is internal (Simvado Studio). In Phase 3, external studios use the same pipeline via the Studio SDK.
