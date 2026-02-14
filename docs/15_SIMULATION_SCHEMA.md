# Simulation Schema

This document defines the JSON structures for simulation scoring, game events, stakeholder profiles, and session data. These schemas are stored in PostgreSQL JSONB columns.

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
- At least 1 dimension required (default 5 for Boardroom Under Pressure)
- Weights must sum to 1.0
- Keys must be unique within a simulation

## Stakeholder Profiles

Stored in `modules.stakeholders`. Array of NPC characters for this module. Used for platform display; game engine maintains its own character data.

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
  }
]
```

## Game Event Schemas

Stored in `game_events.event_data`. The structure varies by `event_type`.

### Decision Event

Reported when the player makes a choice at a decision point.

```json
{
  "eventType": "decision",
  "eventData": {
    "nodeKey": "decision_1",
    "selectedOption": "A",
    "label": "Negotiate a single seat",
    "description": "Offer one board seat as a compromise...",
    "timeSpentSeconds": 47,
    "optionsAvailable": ["A", "B", "C"],
    "context": "The activist investor has demanded two board seats..."
  }
}
```

### Milestone Event

Reported when the player reaches a key narrative moment.

```json
{
  "eventType": "milestone",
  "eventData": {
    "milestoneKey": "cfo_confrontation",
    "label": "CFO Confrontation",
    "description": "The CFO challenges your decision in front of the board",
    "chapter": 2
  }
}
```

### Score Update Event

Reported when scores are recalculated during gameplay.

```json
{
  "eventType": "score_update",
  "eventData": {
    "scores": {
      "financial": 65,
      "reputational": 72,
      "ethical": 80,
      "stakeholder_confidence": 58,
      "long_term_stability": 70
    },
    "total": 69.55,
    "triggeredBy": "decision_1"
  }
}
```

### Completion Event

Reported when the game engine signals the session is complete. This is typically sent via the `/api/game/sessions/:id/complete` endpoint, which also generates a completion event automatically.

```json
{
  "eventType": "completion",
  "eventData": {
    "finalScores": {
      "financial": 72,
      "reputational": 68,
      "ethical": 85,
      "stakeholder_confidence": 63,
      "long_term_stability": 74,
      "total": 73.15
    },
    "totalDurationSeconds": 2847,
    "endingKey": "negotiated_compromise",
    "decisionsCompleted": 4
  }
}
```

### Custom Event

For game-engine-specific data that doesn't fit other categories.

```json
{
  "eventType": "custom",
  "eventData": {
    "type": "npc_interaction",
    "npcId": "npc_cfo",
    "dialogueExchange": "You asked about the financials...",
    "sentiment": "concerned"
  }
}
```

## Final Scores

Stored in `sessions.final_scores`. Submitted by the game engine at completion.

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

## AI Debrief Prompt Template

Used by the platform's AI debrief generator. The platform constructs the prompt from game event data.

```json
{
  "agentId": "debrief_generator",
  "version": "1.0.0",
  "systemInstruction": "You are an executive coach providing a post-simulation debrief. Be direct, specific, and constructive.",
  "contextTemplate": "Simulation: {{simulation_title}}, Module: {{module_title}}. Player decisions: {{decision_events}}. Final scores: {{final_scores}}. Scoring dimensions: {{scoring_config}}.",
  "outputFormat": "Return Markdown with sections: Summary of Decisions, Strengths, Blind Spots, Alternative Paths, Development Recommendations.",
  "maxTokens": 1500,
  "temperature": 0.6
}
```

## Validation Checklist (Pre-Publish)

Before a simulation can be published on the platform:

- [ ] Scoring config has at least 1 dimension with weights summing to 1.0
- [ ] At least 1 module with a title and slug
- [ ] Module has a launch URL or platform set (indicating game engine integration is configured)
- [ ] API key exists for the simulation's game engine integration
- [ ] Narrative context is non-empty for every module
- [ ] At least 1 stakeholder profile per module (for platform display)
- [ ] Game engine integration tested: session creation, event reporting, completion flow
