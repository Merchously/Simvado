# Data Model

Database schema for the Simvado platform. Uses PostgreSQL with Prisma ORM. JSONB columns are used for flexible simulation data structures.

## Entity Relationship Overview

```
User ──────────┐
               ├── Session ── SessionDecision
Organization ──┘        │
  │                     └── Score
  ├── OrgMembership
  ├── SimulationAssignment
  │
Simulation ── Module ── DecisionNode ── NodeOption
                │
                └── MediaAsset
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
| format | ENUM | `branching_narrative`, `realtime_crisis`, `ai_adaptive`, `multiplayer_board` |
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
| narrative_context | TEXT | Markdown — background briefing for the player |
| stakeholders | JSONB | Array of NPC profiles (name, role, motivation, portrait_url) |
| is_free_demo | BOOLEAN | Whether this module is available in free tier |
| estimated_duration_min | INTEGER | |
| status | ENUM | `draft`, `published`, `archived` |
| created_at | TIMESTAMP | |

### decision_nodes

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| module_id | UUID | FK → modules |
| node_key | VARCHAR(50) | Unique key within module (e.g., "decision_1") |
| prompt_text | TEXT | The question/situation presented to the player |
| sort_order | INTEGER | Order within the module flow |
| timer_seconds | INTEGER | Optional countdown timer (null = no timer) |
| pre_video_url | VARCHAR(500) | Video to play before presenting options |
| context_documents | JSONB | Array of prop documents (emails, reports) |
| ai_prompt_template | TEXT | Prompt template for Dialogue Writer Agent |
| created_at | TIMESTAMP | |

### node_options

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| decision_node_id | UUID | FK → decision_nodes |
| option_key | VARCHAR(10) | e.g., "A", "B", "C", "D" |
| label | VARCHAR(255) | Short label displayed on decision card |
| description | TEXT | Expanded description of the choice |
| consequence_video_url | VARCHAR(500) | Video showing consequence of this choice |
| next_node_key | VARCHAR(50) | Key of the next decision node (null = end of module) |
| score_impacts | JSONB | `{ "financial": 15, "reputational": -10, "ethical": 20, ... }` |
| created_at | TIMESTAMP | |

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

A session is one playthrough of a module by a user.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| module_id | UUID | FK → modules |
| organization_id | UUID | FK → organizations (nullable) |
| status | ENUM | `in_progress`, `completed`, `abandoned` |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| total_duration_seconds | INTEGER | |
| final_scores | JSONB | `{ "financial": 72, "reputational": 85, ... , "total": 78 }` |
| debrief_text | TEXT | AI-generated debrief (Markdown) |
| debrief_generated_at | TIMESTAMP | |

### session_decisions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | FK → sessions |
| decision_node_id | UUID | FK → decision_nodes |
| selected_option_id | UUID | FK → node_options |
| time_spent_seconds | INTEGER | How long the player deliberated |
| ai_dialogue_response | TEXT | Dialogue Writer Agent output for this decision |
| score_snapshot | JSONB | Running score totals after this decision |
| decided_at | TIMESTAMP | |

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
CREATE INDEX idx_session_decisions_session ON session_decisions(session_id);
CREATE INDEX idx_decision_nodes_module ON decision_nodes(module_id);
CREATE INDEX idx_node_options_node ON node_options(decision_node_id);
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
- **score_impacts**: Object with 5 keys matching scoring dimensions, values are integers (-100 to +100)
- **final_scores**: Object with 5 dimension scores + total + percentile
- **context_documents**: Array of `{ title, type, content_markdown }`
