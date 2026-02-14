# AI Agent System

## Overview

Simvado uses AI on the **platform side** for post-session analysis and coaching. Gameplay logic, decision branching, NPC behavior, and scoring are handled by the **game engine** (Unreal, Unity, etc.) — not by the platform.

This document defines each AI feature, its role in the platform, and its technical implementation.

## Architecture Principle

**AI handles generative tasks on the platform** (debriefs, coaching, reports). **Game engines handle gameplay** (decision logic, branching, NPC dialogue, scoring). There is no LLM in the gameplay loop — the platform's AI runs after the session completes, using event data reported by the game engine.

```
GAME ENGINE (Runtime — Not Simvado)
├── Decision logic, branching, NPC behavior
├── Score calculation (deterministic)
├── Dynamic dialogue and adaptation
└── Event reporting → Simvado Game Engine API

SIMVADO PLATFORM (Post-Session)
├── Debrief Generator → Personalized coaching analysis
└── Enterprise Analytics → Org-level reports and insights
```

## Platform AI Features

### 1. Debrief Generator

**Role:** Produces personalized post-simulation coaching analysis for the player.

| Property | Value |
|----------|-------|
| AI model | Claude Sonnet |
| When it runs | After session completion (triggered by game engine's completion call) |
| Input | Game events (decisions, milestones, scores), final scores, simulation metadata |
| Output | Structured debrief (Markdown) following the 5-section template |
| Latency target | < 10 seconds |

**Key detail:** The debrief is the highest-value AI output. It must feel like personalized coaching, not generic feedback. The prompt includes the full event timeline from the game engine for context.

**Debrief structure:**
1. Summary of Decisions — What path you took and key choice moments
2. Strengths — What you handled well (tied to scoring dimensions)
3. Blind Spots — What you missed or underweighted
4. Alternative Paths — What would have happened if you chose differently
5. Development Recommendations — Specific skills to develop based on scoring patterns

### 2. Enterprise Analytics Agent

**Role:** Generates aggregate insights and reports for enterprise admins.

| Property | Value |
|----------|-------|
| AI model | Claude |
| When it runs | On-demand (admin requests report) or scheduled (weekly digest) |
| Input | Aggregate session data across org participants |
| Output | Report (PDF/Markdown) with trends, risk areas, recommendations |
| Latency target | < 30 seconds |

**Key detail:** This agent operates at the **organization level**, not the individual simulation level. It's triggered by admin dashboard actions or n8n automation.

## Authoring-Time AI (Content Creation)

During simulation **production** (not runtime), AI can assist the Simvado Studio team:

| Capability | AI Model | Purpose |
|-----------|----------|---------|
| Scenario generation | Claude | Help generate scenario briefs, character profiles, narrative outlines |
| Decision tree review | Claude | Analyze decision trees for balance, identify dead ends |
| Scoring calibration | Claude | Suggest scoring weights based on scenario design |

These are used by the internal team during content creation — they do not run during gameplay or on the platform at runtime.

## What the Game Engine Handles (Not Platform AI)

For clarity, these capabilities live in the game engine, not the Simvado platform:

| Capability | Owner | Notes |
|-----------|-------|-------|
| NPC dialogue | Game Engine | Dynamic character responses during gameplay |
| Decision branching | Game Engine | Decision tree traversal and consequence logic |
| Score calculation | Game Engine | Deterministic scoring from player choices |
| Adaptive difficulty | Game Engine | Adjusting difficulty based on player performance |
| Visual rendering | Game Engine | 3D environments, animations, UI |

The game engine reports the results of these operations to the platform via the Game Engine API (events, scores, completion).

## Prompt Management

AI prompts for the Debrief Generator and Enterprise Analytics are stored as versioned templates. Each prompt includes:
- System instruction (agent role and constraints)
- Context injection points (dynamic data from game events)
- Output format specification (Markdown template)
- Token budget (max tokens per response)

Prompts are versioned so that changes can be tested and rolled back.
