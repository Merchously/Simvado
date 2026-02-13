# Simulation Schema

This document defines the JSON structure for simulation content — decision trees, scoring rubrics, stakeholder profiles, and session state. These schemas are stored in PostgreSQL JSONB columns and validated at publish time.

## Simulation Scoring Config

Stored in `simulations.scoring_config`. Defines how scores are weighted for this simulation.

```json
{
  "dimensions": [
    {
      "key": "financial",
      "label": "Financial Impact",
      "weight": 0.20,
      "description": "Economic consequences of decisions"
    },
    {
      "key": "reputational",
      "label": "Reputational Risk",
      "weight": 0.20,
      "description": "Public perception and brand damage"
    },
    {
      "key": "ethical",
      "label": "Ethical Integrity",
      "weight": 0.25,
      "description": "Alignment with moral and legal standards"
    },
    {
      "key": "stakeholder_confidence",
      "label": "Stakeholder Confidence",
      "weight": 0.20,
      "description": "Trust from board, employees, investors, public"
    },
    {
      "key": "long_term_stability",
      "label": "Long-term Stability",
      "weight": 0.15,
      "description": "Sustainability of decisions over time"
    }
  ],
  "passingScore": 60,
  "maxScorePerDimension": 100
}
```

**Validation rules:**
- Exactly 5 dimensions required
- Weights must sum to 1.0
- All keys must match: `financial`, `reputational`, `ethical`, `stakeholder_confidence`, `long_term_stability`

## Stakeholder Profiles

Stored in `modules.stakeholders`. Array of NPC characters for this module.

```json
[
  {
    "id": "npc_cfo",
    "name": "Margaret Chen",
    "role": "Chief Financial Officer",
    "title": "CFO",
    "motivation": "Protect shareholder value and company stability",
    "personality": "Analytical, risk-averse, loyal to the board",
    "portraitUrl": "https://cdn.simvado.com/assets/npc_cfo.jpg",
    "traits": ["cautious", "data-driven", "diplomatic"],
    "relationship_to_player": "Trusted advisor, reports to you"
  },
  {
    "id": "npc_activist",
    "name": "David Hartwell",
    "role": "Activist Investor",
    "title": "Managing Partner, Hartwell Capital",
    "motivation": "Gain board influence to restructure company",
    "personality": "Aggressive, media-savvy, impatient",
    "portraitUrl": "https://cdn.simvado.com/assets/npc_activist.jpg",
    "traits": ["aggressive", "strategic", "confrontational"],
    "relationship_to_player": "Adversary, external pressure"
  }
]
```

## Decision Node Options — Score Impacts

Stored in `node_options.score_impacts`. Defines how each choice affects scores.

```json
{
  "financial": 15,
  "reputational": -10,
  "ethical": 20,
  "stakeholder_confidence": 5,
  "long_term_stability": 10
}
```

**Rules:**
- Values range from -100 to +100
- Positive = beneficial impact, Negative = harmful impact
- All 5 keys must be present
- No option should be uniformly positive or negative across all dimensions (ensures trade-offs)

## Context Documents

Stored in `decision_nodes.context_documents`. Props the player can review before deciding.

```json
[
  {
    "title": "Letter from Hartwell Capital",
    "type": "email",
    "contentMarkdown": "Dear Board Chair,\n\nWe are writing to formally request..."
  },
  {
    "title": "Q3 Financial Summary",
    "type": "report",
    "contentMarkdown": "## Revenue\n- Q3 Revenue: $2.1B (down 3% YoY)..."
  },
  {
    "title": "Media Coverage: Investor Tensions",
    "type": "news",
    "contentMarkdown": "**Bloomberg** — Hartwell Capital escalates push for board seats at..."
  }
]
```

**Valid types:** `email`, `report`, `news`, `memo`, `legal`, `financial`

## Session State (Runtime)

Stored in `sessions.final_scores` and `session_decisions.score_snapshot`.

### Running Score Snapshot

After each decision, the running total is stored:

```json
{
  "financial": 65,
  "reputational": 72,
  "ethical": 80,
  "stakeholder_confidence": 58,
  "long_term_stability": 70,
  "total": 69.55,
  "decisionsCompleted": 2,
  "decisionsTotal": 4
}
```

### Final Scores

At session completion:

```json
{
  "financial": 72,
  "reputational": 68,
  "ethical": 85,
  "stakeholder_confidence": 63,
  "long_term_stability": 74,
  "total": 73.15,
  "percentile": 68,
  "grade": "B+",
  "completedAt": "2026-03-15T14:30:00Z",
  "totalDurationSeconds": 2847
}
```

### Grade Scale

| Score | Grade |
|-------|-------|
| 90–100 | A+ |
| 85–89 | A |
| 80–84 | A- |
| 75–79 | B+ |
| 70–74 | B |
| 65–69 | B- |
| 60–64 | C+ |
| 55–59 | C |
| 50–54 | C- |
| < 50 | D |

## AI Prompt Template Schema

Stored in CMS. Used by Dialogue Writer and Debrief Generator agents.

### Dialogue Writer Prompt

```json
{
  "agentId": "dialogue_writer",
  "version": "1.0.0",
  "systemInstruction": "You are an NPC in a corporate boardroom simulation. Stay in character. Respond to the player's decision with realistic dialogue.",
  "contextTemplate": "The player is {{player_role}}. The scenario is {{scenario_context}}. The NPC is {{npc_name}} ({{npc_role}}). Their motivation: {{npc_motivation}}. The player just chose: {{player_choice}}. Previous decisions: {{decision_history}}.",
  "outputFormat": "Return a JSON object: { \"dialogue\": \"...\", \"tone\": \"supportive|hostile|neutral|concerned\" }",
  "maxTokens": 300,
  "temperature": 0.7
}
```

### Debrief Generator Prompt

```json
{
  "agentId": "debrief_generator",
  "version": "1.0.0",
  "systemInstruction": "You are an executive coach providing a post-simulation debrief. Be direct, specific, and constructive.",
  "contextTemplate": "Simulation: {{simulation_title}}, Module: {{module_title}}. Player decisions: {{decision_log}}. Final scores: {{final_scores}}. Scoring dimensions: {{scoring_config}}.",
  "outputFormat": "Return Markdown with sections: Summary of Decisions, Strengths, Blind Spots, Alternative Paths, Development Recommendations.",
  "maxTokens": 1500,
  "temperature": 0.6
}
```

## Validation Checklist (Pre-Publish)

Before a simulation can be published, it must pass these automated checks:

- [ ] Scoring config has exactly 5 dimensions with weights summing to 1.0
- [ ] Every module has at least 2 decision nodes
- [ ] Every decision node has 3–4 options
- [ ] Every option has score_impacts for all 5 dimensions
- [ ] No option is uniformly positive or negative (trade-off requirement)
- [ ] All `next_node_key` references point to valid nodes or null (terminal)
- [ ] No orphan nodes (every node is reachable from the starting node)
- [ ] All media URLs are valid and accessible
- [ ] Narrative context is non-empty for every module
- [ ] At least 1 stakeholder profile per module
- [ ] AI prompt templates are present for modules using AI dialogue
