# API Design

REST API contracts for the Simvado platform. All endpoints are prefixed with `/api`.

## Authentication

The platform has two authentication mechanisms:

### 1. Clerk JWT (Platform Users)

For platform-facing endpoints (dashboard, catalog, analytics). Passed as Bearer token.

```
Authorization: Bearer <clerk_jwt_token>
```

Role-based access is enforced server-side. Roles: `individual`, `enterprise_admin`, `enterprise_participant`, `studio_creator`, `platform_admin`.

### 2. API Key (Game Engines)

For game engine integration endpoints (`/api/game/*`). API keys are SHA-256 hashed and stored in the `api_keys` table.

```
Authorization: Bearer sk_sim_<random_hex>
```

API keys are scoped per simulation and have configurable expiration.

## Game Engine API (`/api/game/*`)

These endpoints are used by game engines (Unreal, Unity, etc.) to report gameplay data to the platform. Authenticated via API key.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/game/sessions` | Create a new session | API Key |
| GET | `/api/game/sessions/:id` | Get session state | API Key |
| POST | `/api/game/sessions/:id/events` | Report game events (decisions, milestones, scores) | API Key |
| GET | `/api/game/sessions/:id/events` | List events for a session | API Key |
| POST | `/api/game/sessions/:id/complete` | Signal session completion with final scores | API Key |

### POST /api/game/sessions

Create a session when a player starts a simulation in the game engine.

**Request:**
```json
{
  "userId": "uuid",
  "moduleId": "uuid",
  "externalSessionId": "game-engine-session-123",
  "platform": "unreal"
}
```

**Response (201):**
```json
{
  "sessionId": "uuid",
  "externalSessionId": "game-engine-session-123"
}
```

### GET /api/game/sessions/:id

Read session state including user, module, and events.

**Response (200):**
```json
{
  "id": "uuid",
  "status": "in_progress",
  "userId": "uuid",
  "moduleId": "uuid",
  "platform": "unreal",
  "startedAt": "2026-03-15T14:00:00Z",
  "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" },
  "module": { "id": "uuid", "title": "Activist Investor Showdown", "simulationId": "uuid" },
  "gameEvents": [...]
}
```

### POST /api/game/sessions/:id/events

Report gameplay events. Supports single events or batches.

**Request (single):**
```json
{
  "eventType": "decision",
  "eventData": {
    "nodeKey": "decision_1",
    "selectedOption": "A",
    "label": "Negotiate a single seat",
    "timeSpentSeconds": 47,
    "optionsAvailable": ["A", "B", "C"]
  },
  "timestamp": "2026-03-15T14:05:30Z"
}
```

**Request (batch):**
```json
{
  "events": [
    { "eventType": "decision", "eventData": {...}, "timestamp": "..." },
    { "eventType": "score_update", "eventData": {...}, "timestamp": "..." }
  ]
}
```

**Response (201):**
```json
{
  "created": 1,
  "eventIds": ["uuid"]
}
```

**Valid event types:** `decision`, `milestone`, `score_update`, `completion`, `custom`

### POST /api/game/sessions/:id/complete

Signal that a simulation session is complete. Triggers AI debrief generation.

**Request:**
```json
{
  "finalScores": {
    "financial": 72,
    "reputational": 68,
    "ethical": 85,
    "stakeholder_confidence": 63,
    "long_term_stability": 74,
    "total": 73.15
  },
  "totalDurationSeconds": 2847
}
```

**Response (200):**
```json
{
  "sessionId": "uuid",
  "status": "completed",
  "finalScores": {...},
  "debriefText": "## Your Performance...",
  "debriefGeneratedAt": "2026-03-15T14:50:00Z"
}
```

---

## Platform API (Clerk JWT Auth)

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
| GET | `/api/simulations/:slug/modules/:moduleSlug` | Get module detail | Any authenticated (subscription check) |

**Query parameters for GET /api/simulations:**
```
?category=Executive+Leadership
&difficulty=advanced
&skill=Crisis+Response
&format=unreal_3d
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
  "format": "unreal_3d",
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
      "estimatedDurationMin": 45,
      "platform": "unreal",
      "launchUrl": "simvado://launch/bup-module-1",
      "buildVersion": "1.0.0"
    }
  ]
}
```

### Sessions & Analytics (Platform Users)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/sessions` | Create a new session (from platform UI) | Any authenticated |
| GET | `/api/sessions/:id/analytics` | Get session analytics (scores, event timeline) | Session owner |
| GET | `/api/sessions/:id/debrief` | Get or generate AI debrief | Session owner |

**Response: GET /api/sessions/:id/analytics**
```json
{
  "session": {
    "id": "uuid",
    "status": "completed",
    "startedAt": "2026-03-15T14:00:00Z",
    "completedAt": "2026-03-15T14:47:27Z",
    "totalDurationSeconds": 2847,
    "platform": "unreal"
  },
  "simulation": {
    "title": "Boardroom Under Pressure",
    "module": "Activist Investor Showdown"
  },
  "finalScores": {
    "financial": 72,
    "reputational": 68,
    "ethical": 85,
    "stakeholder_confidence": 63,
    "long_term_stability": 74,
    "total": 73.15
  },
  "timeline": {
    "decisions": [...],
    "milestones": [...],
    "scoreUpdates": [...]
  }
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
| POST | `/api/admin/api-keys` | Generate API key for game engine integration | Platform admin |
| DELETE | `/api/admin/api-keys/:id` | Revoke API key | Platform admin |
| POST | `/api/admin/media/upload` | Upload media asset | Platform admin |

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

Standard HTTP status codes: 200, 201, 400, 401, 403, 404, 422, 429, 500.

## Rate Limiting

| Endpoint Category | Limit |
|-------------------|-------|
| Platform API | 100 requests/minute per user |
| Game Engine API | 500 requests/minute per API key |
| AI endpoints (debrief) | 20 requests/minute per user |
| Webhooks | 1000 requests/minute |
| Media upload | 10 requests/minute per user |
