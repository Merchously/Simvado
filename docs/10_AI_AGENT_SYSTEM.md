# AI Agent System

## Overview

Simvado uses a hybrid AI architecture: **generative AI** for dynamic content (dialogue, debriefs, adaptation) and **deterministic logic** for structured operations (scoring, branching, state management).

This document defines each agent, its role in the simulation flow (see 08_SIMULATION_DESIGN_FRAMEWORK.md), and its technical implementation.

## Agent Inventory

### 1. Scenario Generator Agent

**Role:** Creates and delivers simulation context — the world, stakes, and characters.

| Property | Value |
|----------|-------|
| Simulation steps | Step 1 (Context Setup), Step 2 (Stakeholder Mapping) |
| AI model | Claude API |
| When it runs | Authoring time (not runtime) |
| Input | Simulation brief, industry context, scenario parameters |
| Output | Narrative text (Markdown), stakeholder profiles (JSON) |

**Key detail:** This agent runs during **content creation**, not during gameplay. It helps the Simvado Studio team author simulation content faster. At runtime, the authored content is served statically.

### 2. Dialogue Writer Agent

**Role:** Generates dynamic NPC dialogue in response to player decisions.

| Property | Value |
|----------|-------|
| Simulation step | Step 4 (Branching Consequence) |
| AI model | Claude API |
| When it runs | Runtime (per decision node) |
| Input | Player's choice, NPC profile, conversation history, game state |
| Output | NPC dialogue text, emotional tone indicator |
| Latency target | < 3 seconds |

**Key detail:** This is the primary runtime AI agent. It makes NPCs feel responsive and alive. Dialogue is generated on each playthrough, not pre-authored, so no two sessions are identical.

### 3. Decision Tree Architect Agent

**Role:** Assists in designing branching logic and ensures decision trees are balanced.

| Property | Value |
|----------|-------|
| Simulation steps | Step 3 (Decision Node), Step 4 (Branching Consequence) |
| AI model | Claude API |
| When it runs | Authoring time |
| Input | Scenario outline, desired complexity level, target decision count |
| Output | Decision tree JSON (per 15_SIMULATION_SCHEMA.md) |

**Key detail:** Authoring-time agent only. At runtime, the decision tree is traversed deterministically — no AI needed for branching logic.

### 4. Scoring Engine (Deterministic)

**Role:** Calculates multi-dimensional scores based on player choices.

| Property | Value |
|----------|-------|
| Simulation step | Step 6 (Scorecard) |
| AI model | None — pure deterministic logic |
| When it runs | Runtime (per decision node + end of simulation) |
| Input | Player choices, scoring rubric JSON, dimension weights |
| Output | Score object (5-axis scores, total, percentile) |
| Latency target | < 100ms |

**Key detail:** No AI in the scoring loop. Scores are calculated from pre-defined rubrics in JSON. This ensures consistency, auditability, and speed.

### 5. Adaptive Engine

**Role:** Adjusts simulation difficulty and reveals/hides narrative paths based on player performance.

| Property | Value |
|----------|-------|
| Simulation step | Step 5 (AI Adaptation) |
| AI model | Claude API (Phase 2+) |
| When it runs | Runtime (between decision rounds) |
| Input | Cumulative scores, player choice history, difficulty parameters |
| Output | Adjusted game state (unlock/lock paths, modify NPC behavior) |
| Latency target | < 5 seconds |

**Key detail:** Phase 1 uses **rule-based adaptation** (if score < threshold, adjust difficulty). Phase 2 introduces Claude-powered dynamic adaptation for more nuanced scenario evolution.

### 6. Debrief Generator Agent

**Role:** Produces personalized post-simulation analysis for the player.

| Property | Value |
|----------|-------|
| Simulation step | Step 7 (Debrief) |
| AI model | Claude API |
| When it runs | Runtime (end of simulation) |
| Input | Full session data — choices, scores, timing, path taken |
| Output | Structured debrief (Markdown) following the 5-section template |
| Latency target | < 10 seconds |

**Key detail:** The debrief is the highest-value AI output. It must feel like personalized coaching, not generic feedback. The prompt includes the full session transcript for context.

### 7. Enterprise Analytics Agent

**Role:** Generates aggregate insights and reports for enterprise admins.

| Property | Value |
|----------|-------|
| Simulation step | Outside simulation flow |
| AI model | Claude API |
| When it runs | On-demand (admin requests report) or scheduled (weekly digest) |
| Input | Aggregate session data across org participants |
| Output | Report (PDF/Markdown) with trends, risk areas, recommendations |
| Latency target | < 30 seconds |

**Key detail:** This agent operates at the **organization level**, not the individual simulation level. It's triggered by n8n automation or admin dashboard actions.

## Agent Architecture Summary

```
AUTHORING TIME (Content Creation)
├── Scenario Generator Agent ──→ Narrative + Stakeholders
├── Decision Tree Architect ───→ Decision Tree JSON
└── (Human review + QA)

RUNTIME (Player Session)
├── Step 1-2: Static content served (pre-authored)
├── Step 3:   Decision node presented (deterministic)
├── Step 4:   Dialogue Writer Agent ──→ NPC responses
├── Step 5:   Adaptive Engine ────────→ Adjusted state
├── Step 6:   Scoring Engine ─────────→ Scores (no AI)
└── Step 7:   Debrief Generator ──────→ Personalized debrief

POST-SESSION (Enterprise)
└── Enterprise Analytics Agent ───→ Org-level reports
```

## Prompt Management

All AI prompts are stored in the CMS as versioned templates. Each prompt includes:
- System instruction (agent role and constraints)
- Context injection points (dynamic data from game state)
- Output format specification (JSON schema or Markdown template)
- Token budget (max tokens per response)

Prompts are versioned alongside simulation content so that changes can be tested and rolled back.
