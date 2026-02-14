# Simulation Design Framework

This framework defines the universal structure every Simvado simulation must follow, regardless of which game engine is used. It maps responsibilities between the game engine and the Simvado platform.

## The 7-Step Simulation Flow

Every simulation follows these steps in sequence. Each step has a designated owner (game engine or platform) and a defined data output.

| Step | Name | What Happens | Owner | Output |
|------|------|-------------|-------|--------|
| 1 | **Context Setup** | Player receives background briefing — setting, stakes, timeline | Game Engine | In-engine narrative + media |
| 2 | **Stakeholder Mapping** | Player meets key characters, reviews their profiles and agendas | Game Engine | In-engine character interactions |
| 3 | **Decision Node** | Player faces a choice — 3–4 options with time pressure | Game Engine | Decision event → Platform API |
| 4 | **Branching Consequence** | World reacts to the player's choice — NPC responses, new information | Game Engine | Milestone event → Platform API |
| 5 | **Score Calculation** | Engine calculates scores based on decisions and cumulative game state | Game Engine | Score update event → Platform API |
| 6 | **Scorecard** | Multi-dimensional score displayed and stored | Platform | Score visualization on dashboard |
| 7 | **Debrief** | Personalized AI-generated analysis of the player's decisions | Platform | AI debrief text (Markdown) |

Steps 3–5 repeat for each decision round within a module (typically 2–4 rounds). Steps 6–7 happen after the game engine signals completion.

### Event Reporting

During gameplay, the game engine reports events to the Simvado platform via the Game Engine API:

| Event Type | When | Data Reported |
|-----------|------|---------------|
| `decision` | Player makes a choice | Choice details, options available, time spent |
| `milestone` | Key narrative moment reached | Milestone identifier, context |
| `score_update` | After score recalculation | Current scores per dimension |
| `completion` | End of module | Final scores, total duration |

## Scoring Dimensions

Every simulation scores across configurable axes. The default configuration uses 5 axes. Weights vary by simulation but all dimensions must be present.

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
  dimension_score = 0–100 (calculated by game engine per decision)
  dimension_weight = 0.0–1.0 (must sum to 1.0 across all dimensions)
```

Scores are cumulative across decision rounds. The game engine calculates scores and reports them to the platform. Final score is compared against:
- Perfect path (best possible score)
- Peer average (anonymized aggregate from other players)

## Design Principles

Every simulation must:

1. **Feel immersive** — high production value in the chosen game engine, professional tone
2. **Feel consequential** — decisions have visible, meaningful impact on the scenario
3. **Provide measurable feedback** — quantitative scores reported to platform, not just narrative
4. **Support replay** — different paths yield genuinely different outcomes and scores
5. **Be self-contained** — each module works standalone (no dependency on other modules)
6. **Integrate with Simvado** — all simulations must report events via the Game Engine API

## Decision Node Design Rules

- Minimum 3, maximum 4 options per decision node
- No objectively "correct" answer — all options have trade-offs
- At least one option must present an ethical tension
- Time pressure is optional but recommended (60–120 second timer)
- Options must be distinct — no two options should lead to the same outcome

## Debrief Structure

The AI-generated debrief is produced by the Simvado platform from game event data. It follows this template:

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
