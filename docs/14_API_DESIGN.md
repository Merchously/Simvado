# API Design

REST API contracts for the Simvado platform. All endpoints are prefixed with `/api`. Authentication uses Clerk JWT tokens passed as Bearer tokens.

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <clerk_jwt_token>
```

Role-based access is enforced server-side. Roles: `individual`, `enterprise_admin`, `enterprise_participant`, `studio_creator`, `platform_admin`.

## API Endpoints

### Auth & User Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/webhooks/clerk` | Clerk webhook — syncs user records to database | Webhook secret |
| GET | `/api/me` | Get current user profile | Any authenticated |
| PATCH | `/api/me` | Update current user profile | Any authenticated |

### Simulations (Catalog)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/simulations` | List published simulations (with filters) | Any authenticated |
| GET | `/api/simulations/:slug` | Get simulation detail + module list | Any authenticated |
| GET | `/api/simulations/:slug/modules/:moduleSlug` | Get module detail (narrative, stakeholders) | Any authenticated (subscription check) |

**Query parameters for GET /api/simulations:**
```
?category=Executive+Leadership
&difficulty=advanced
&skill=Crisis+Response
&format=branching_narrative
&page=1
&limit=20
&sort=newest|popular
```

**Response: GET /api/simulations/:slug**
```json
{
  "id": "uuid",
  "title": "Boardroom Under Pressure",
  "slug": "boardroom-under-pressure",
  "description": "...",
  "category": "Executive Leadership",
  "difficulty": "executive",
  "format": "branching_narrative",
  "skillTags": ["Governance", "Risk Management", "Ethical Judgment"],
  "estimatedDurationMin": 60,
  "thumbnailUrl": "https://cdn.simvado.com/...",
  "modules": [
    {
      "id": "uuid",
      "title": "Activist Investor Showdown",
      "slug": "activist-investor-showdown",
      "sortOrder": 1,
      "isFreeDemo": true,
      "estimatedDurationMin": 45
    }
  ]
}
```

### Simulation Player (Session)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/sessions` | Start a new simulation session | Any authenticated |
| GET | `/api/sessions/:id` | Get session state (current node, scores) | Session owner |
| GET | `/api/sessions/:id/node` | Get current decision node with options | Session owner |
| POST | `/api/sessions/:id/decide` | Submit a decision | Session owner |
| GET | `/api/sessions/:id/scorecard` | Get final scorecard | Session owner |
| GET | `/api/sessions/:id/debrief` | Get AI-generated debrief | Session owner |

**Request: POST /api/sessions**
```json
{
  "moduleId": "uuid"
}
```

**Response: GET /api/sessions/:id/node**
```json
{
  "nodeKey": "decision_1",
  "promptText": "The activist investor has demanded two board seats...",
  "timerSeconds": 90,
  "preVideoUrl": "https://cdn.simvado.com/...",
  "contextDocuments": [
    { "title": "Investor Letter", "type": "email", "contentMarkdown": "..." }
  ],
  "options": [
    {
      "id": "uuid",
      "optionKey": "A",
      "label": "Negotiate a single seat",
      "description": "Offer one board seat as a compromise..."
    },
    {
      "id": "uuid",
      "optionKey": "B",
      "label": "Reject the demand entirely",
      "description": "Stand firm on current board composition..."
    },
    {
      "id": "uuid",
      "optionKey": "C",
      "label": "Accept both seats",
      "description": "Concede to avoid a public proxy fight..."
    }
  ]
}
```

**Request: POST /api/sessions/:id/decide**
```json
{
  "optionId": "uuid",
  "timeSpentSeconds": 47
}
```

**Response: POST /api/sessions/:id/decide**
```json
{
  "consequenceVideoUrl": "https://cdn.simvado.com/...",
  "aiDialogue": "The board erupts. The CFO leans over and whispers...",
  "runningScores": {
    "financial": 65,
    "reputational": 72,
    "ethical": 80,
    "stakeholderConfidence": 58,
    "longTermStability": 70
  },
  "nextNodeKey": "decision_2",
  "isComplete": false
}
```

### User Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/me/sessions` | List user's session history | Any authenticated |
| GET | `/api/me/stats` | Get user's aggregate stats (scores, completions) | Any authenticated |
| GET | `/api/me/assignments` | List assigned simulations (enterprise participants) | Enterprise participant |

### Enterprise Admin (Phase 2)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/org` | Get organization details | Enterprise admin |
| GET | `/api/org/members` | List organization members | Enterprise admin |
| POST | `/api/org/members/invite` | Invite members by email | Enterprise admin |
| DELETE | `/api/org/members/:userId` | Remove member | Enterprise admin |
| POST | `/api/org/assignments` | Assign simulation to members | Enterprise admin |
| GET | `/api/org/analytics` | Get aggregate analytics | Enterprise admin |
| GET | `/api/org/analytics/export` | Export analytics as CSV/PDF | Enterprise admin |

**Request: POST /api/org/assignments**
```json
{
  "simulationId": "uuid",
  "userIds": ["uuid", "uuid", "uuid"],
  "dueDate": "2026-04-15"
}
```

### Billing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/webhooks/stripe` | Stripe webhook — subscription lifecycle events | Webhook secret |
| POST | `/api/billing/checkout` | Create Stripe checkout session | Any authenticated |
| GET | `/api/billing/portal` | Get Stripe customer portal URL | Any authenticated |

### CMS (Platform Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/simulations` | List all simulations (all statuses) | Platform admin |
| POST | `/api/admin/simulations` | Create new simulation | Platform admin |
| PATCH | `/api/admin/simulations/:id` | Update simulation metadata | Platform admin |
| POST | `/api/admin/simulations/:id/publish` | Publish simulation | Platform admin |
| POST | `/api/admin/modules` | Create module within simulation | Platform admin |
| PATCH | `/api/admin/modules/:id` | Update module content | Platform admin |
| POST | `/api/admin/modules/:id/nodes` | Create decision node | Platform admin |
| PATCH | `/api/admin/nodes/:id` | Update decision node | Platform admin |
| POST | `/api/admin/nodes/:id/options` | Create node option | Platform admin |
| POST | `/api/admin/media/upload` | Upload media asset | Platform admin |

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this resource.",
    "details": {}
  }
}
```

Standard HTTP status codes: 200, 201, 400, 401, 403, 404, 422, 429, 500.

## Rate Limiting

| Endpoint Category | Limit |
|-------------------|-------|
| General API | 100 requests/minute per user |
| AI endpoints (debrief, dialogue) | 20 requests/minute per user |
| Webhooks | 1000 requests/minute |
| Media upload | 10 requests/minute per user |
