# Simulation Design Framework

This framework defines the universal structure every Simvado simulation must follow. It maps directly to the AI Agent System (see 10_AI_AGENT_SYSTEM.md) and the Simulation Schema (see 15_SIMULATION_SCHEMA.md).

## The 7-Step Simulation Flow

Every simulation follows these steps in sequence. Each step has a responsible AI agent and a defined data output.

| Step | Name | What Happens | AI Agent | Output |
|------|------|-------------|----------|--------|
| 1 | **Context Setup** | Player receives background briefing — setting, stakes, timeline | Scenario Generator | Narrative text + media assets |
| 2 | **Stakeholder Mapping** | Player meets key characters, reviews their profiles and agendas | Scenario Generator | Stakeholder JSON (profiles, motivations, relationships) |
| 3 | **Decision Node** | Player faces a choice — 3–4 options with time pressure | Decision Tree Architect | Decision node JSON (options, metadata) |
| 4 | **Branching Consequence** | World reacts to the player's choice — NPC responses, new information | Dialogue Writer + Decision Tree Architect | Branch resolution JSON + dialogue |
| 5 | **AI Adaptation** | Engine adjusts difficulty, reveals new paths based on cumulative choices | Adaptive Engine (runtime) | Updated game state |
| 6 | **Scorecard** | Multi-dimensional score calculated across 5 axes | Scoring Engine (deterministic) | Score JSON |
| 7 | **Debrief** | Personalized AI-generated analysis of the player's decisions | Debrief Generator | Debrief text (Markdown) |

Steps 3–5 repeat for each decision round within a module (typically 2–4 rounds).

## Scoring Dimensions

Every simulation scores across these 5 axes. Weights vary by simulation but all 5 must be present.

| Dimension | What It Measures | Example |
|-----------|-----------------|---------|
| **Financial Impact** | Economic consequences of decisions | Revenue loss, cost of settlement, market cap impact |
| **Reputational Risk** | Public perception and brand damage | Media coverage, social media sentiment, trust erosion |
| **Ethical Integrity** | Alignment with moral and legal standards | Whistleblower protection, transparency, honesty |
| **Stakeholder Confidence** | Trust from board, employees, investors, public | Board support %, employee morale, investor sentiment |
| **Long-term Stability** | Sustainability of decisions over time | Precedent set, systemic risk, organizational resilience |

### Scoring Formula

```
total_score = Σ (dimension_score × dimension_weight)

Where:
  dimension_score = 0–100 (calculated per decision node)
  dimension_weight = 0.0–1.0 (must sum to 1.0 across all 5)
```

Scores are cumulative across decision rounds. Final score is compared against:
- Perfect path (best possible score)
- Peer average (anonymized aggregate from other players)

## Design Principles

Every simulation must:

1. **Feel cinematic** — high production value, immersive narrative, professional tone
2. **Feel consequential** — decisions have visible, meaningful impact on the scenario
3. **Provide measurable feedback** — quantitative scores, not just qualitative narrative
4. **Support replay** — different paths yield genuinely different outcomes and scores
5. **Be self-contained** — each module works standalone (no dependency on other modules)

## Decision Node Design Rules

- Minimum 3, maximum 4 options per decision node
- No objectively "correct" answer — all options have trade-offs
- At least one option must present an ethical tension
- Time pressure is optional but recommended (60–120 second timer)
- Options must be distinct — no two options should lead to the same outcome

## Debrief Structure

The AI-generated debrief follows this template:

```
1. Summary of Decisions
   - What path you took and key choice moments

2. Strengths
   - What you handled well (tied to scoring dimensions)

3. Blind Spots
   - What you missed or underweighted

4. Alternative Paths
   - What would have happened if you chose differently at key nodes

5. Development Recommendations
   - Specific skills to develop based on scoring patterns
```
