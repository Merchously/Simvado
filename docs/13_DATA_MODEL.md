# Data Model

Database schema for the Simvado platform. Uses PostgreSQL with Prisma ORM. JSONB columns are used for flexible game event data and scoring structures.

## Entity Relationship Overview

```
User ──────────┐
               ├── Session ── GameEvent
Organization ──┘        │
  │                     └── Score
  ├── OrgMembership
  ├── SimulationAssignment
  │
Simulation ── Module
                │
                └── MediaAsset

ApiKey (for game engine authentication)
```

## Core Tables

### users

Managed by Clerk (external). Simvado stores a mirror record for relational joins.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| clerk_id | VARCHAR(255) | Clerk user ID (unique) |
| email | VARCHAR(255) | User email |
| name | VARCHAR(255) | Display name |
| role | ENUM | `individual`, `enterprise_admin`, `enterprise_participant`, `studio_creator`, `platform_admin` |
| organization_id | UUID | FK → organizations (nullable for individual users) |
| subscription_tier | ENUM | `free`, `pro_monthly`, `pro_annual`, `enterprise` |
| stripe_customer_id | VARCHAR(255) | Stripe customer reference |
| created_at | TIMESTAMP | Account creation |
| updated_at | TIMESTAMP | Last update |

### organizations

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Organization name |
| slug | VARCHAR(100) | URL-safe identifier (unique) |
| plan | ENUM | `pilot`, `standard`, `enterprise` |
| seat_limit | INTEGER | Max seats for this plan |
| stripe_subscription_id | VARCHAR(255) | Stripe subscription reference |
| sso_enabled | BOOLEAN | Whether SSO is configured |
| sso_provider | VARCHAR(50) | SAML/OIDC provider name |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### org_memberships

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| organization_id | UUID | FK → organizations |
| role | ENUM | `admin`, `participant` |
| department | VARCHAR(100) | Department name (for segmentation) |
| joined_at | TIMESTAMP | |

### simulations

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Simulation title |
| slug | VARCHAR(100) | URL-safe identifier (unique) |
| description | TEXT | Short description |
| category | VARCHAR(100) | Primary category (e.g., "Executive Leadership") |
| skill_tags | TEXT[] | Array of skill tags |
| difficulty | ENUM | `foundational`, `intermediate`, `advanced`, `executive` |
| format | ENUM | `branching_narrative`, `realtime_crisis`, `ai_adaptive`, `multiplayer_board`, `unreal_3d`, `unity_3d`, `external_custom` |
| status | ENUM | `draft`, `review`, `staged`, `published`, `archived` |
| thumbnail_url | VARCHAR(500) | Cover image URL |
| estimated_duration_min | INTEGER | Expected play time in minutes |
| author_id | UUID | FK → users (studio creator or platform admin) |
| scoring_config | JSONB | Dimension weights and scoring parameters |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| published_at | TIMESTAMP | |

### modules

Each simulation contains one or more modules (standalone playable scenarios).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| simulation_id | UUID | FK → simulations |
| title | VARCHAR(255) | Module title (e.g., "Activist Investor Showdown") |
| slug | VARCHAR(100) | |
| sort_order | INTEGER | Display order within simulation |
| narrative_context | TEXT | Markdown — background briefing |
| stakeholders | JSONB | Array of NPC profiles (name, role, motivation, portrait_url) |
| is_free_demo | BOOLEAN | Whether this module is available in free tier |
| estimated_duration_min | INTEGER | |
| launch_url | VARCHAR(500) | URL to launch the game engine application |
| platform | ENUM | `unreal`, `unity`, `web`, `other` |
| build_version | VARCHAR(50) | Game engine build version identifier |
| status | ENUM | `draft`, `published`, `archived` |
| created_at | TIMESTAMP | |

### game_events

Generic event storage for data reported by game engines during gameplay.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | FK → sessions |
| event_type | ENUM | `decision`, `milestone`, `score_update`, `completion`, `custom` |
| event_data | JSONB | Flexible event payload (varies by event type) |
| timestamp | TIMESTAMP | When the event occurred in-game |
| received_at | TIMESTAMP | When the platform received the event |

### api_keys

API keys for game engine authentication (separate from Clerk user auth).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Descriptive name (e.g., "BUP Unreal Build") |
| key_hash | VARCHAR(255) | SHA-256 hash of the full API key (unique) |
| key_prefix | VARCHAR(15) | First 15 chars for identification (e.g., "sk_sim_a1b2c3") |
| simulation_id | UUID | FK → simulations (nullable — can scope to specific simulation) |
| organization_id | UUID | FK → organizations (nullable) |
| scopes | TEXT[] | Permission scopes (default: `["game:write"]`) |
| is_active | BOOLEAN | Whether the key is active |
| last_used_at | TIMESTAMP | Last API call with this key |
| created_at | TIMESTAMP | |
| expires_at | TIMESTAMP | Optional expiration date |

### media_assets

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| module_id | UUID | FK → modules |
| type | ENUM | `video`, `image`, `audio`, `document` |
| url | VARCHAR(500) | CDN URL |
| filename | VARCHAR(255) | Original filename |
| size_bytes | BIGINT | File size |
| duration_seconds | INTEGER | For video/audio |
| uploaded_at | TIMESTAMP | |

### sessions

A session is one playthrough of a module by a user. Created by the platform or game engine.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| module_id | UUID | FK → modules |
| organization_id | UUID | FK → organizations (nullable) |
| external_session_id | VARCHAR(255) | Game engine's internal session ID (unique) |
| platform | ENUM | `unreal`, `unity`, `web`, `other` |
| launch_url | VARCHAR(500) | URL used to launch this session |
| status | ENUM | `in_progress`, `completed`, `abandoned` |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| total_duration_seconds | INTEGER | |
| final_scores | JSONB | `{ "financial": 72, "reputational": 85, ... , "total": 78 }` |
| debrief_text | TEXT | AI-generated debrief (Markdown) |
| debrief_generated_at | TIMESTAMP | |

### simulation_assignments

Enterprise admins assign simulations to participants.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK → organizations |
| assigned_by_user_id | UUID | FK → users (admin) |
| assigned_to_user_id | UUID | FK → users (participant) |
| simulation_id | UUID | FK → simulations |
| due_date | DATE | Optional deadline |
| status | ENUM | `assigned`, `in_progress`, `completed`, `overdue` |
| assigned_at | TIMESTAMP | |

## Indexes

```sql
-- Performance-critical queries
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_module_id ON sessions(module_id);
CREATE INDEX idx_sessions_org_id ON sessions(organization_id);
CREATE INDEX idx_game_events_session ON game_events(session_id);
CREATE INDEX idx_game_events_type ON game_events(event_type);
CREATE INDEX idx_org_memberships_org ON org_memberships(organization_id);
CREATE INDEX idx_org_memberships_user ON org_memberships(user_id);
CREATE INDEX idx_assignments_org ON simulation_assignments(organization_id);
CREATE INDEX idx_assignments_user ON simulation_assignments(assigned_to_user_id);
CREATE INDEX idx_simulations_status ON simulations(status);
```

## JSONB Schema Notes

The JSONB columns store structured data that varies per simulation. Key schemas:

- **scoring_config**: See 15_SIMULATION_SCHEMA.md for full specification
- **stakeholders**: Array of `{ name, role, motivation, portrait_url, personality_traits[] }`
- **event_data**: Varies by event type — see 15_SIMULATION_SCHEMA.md for event schemas
- **final_scores**: Object with dimension scores + total + percentile
