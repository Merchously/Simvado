# User Flows

Core user journeys for the Simvado platform. Each flow maps to specific API endpoints (see 14_API_DESIGN.md) and UI screens.

## Flow 1: Individual Professional — Sign Up to First Simulation

```
1. LANDING PAGE (simvado.com)
   └─ User sees hero: "The Flight Simulator for Leadership"
   └─ CTA: "Try a Free Simulation"

2. SIGN UP (Clerk)
   └─ Email/password or Google/Microsoft OAuth
   └─ User created with role: individual, tier: free

3. ONBOARDING
   └─ Welcome screen: "Start with Boardroom Under Pressure"
   └─ Brief explanation of how simulations work
   └─ CTA: "Begin Simulation"

4. SIMULATION CATALOG
   └─ Grid of available simulations
   └─ Free badge on Module 1 (Activist Investor Showdown)
   └─ Pro badge on other modules (locked for free users)
   └─ Filters: category, skill, difficulty

5. MODULE BRIEFING
   └─ Narrative context (text + optional intro video)
   └─ Stakeholder profiles displayed
   └─ "Start Simulation" button

6. SIMULATION PLAYER
   └─ Video scene plays (briefing)
   └─ Decision overlay appears with 3-4 options
   └─ Optional timer counting down
   └─ Player selects option
   └─ Consequence video plays
   └─ AI dialogue response displayed
   └─ Next decision round begins
   └─ Repeat for 2-4 rounds

7. SCORECARD
   └─ 5-axis radar chart
   └─ Total score and grade
   └─ Comparison to peer average
   └─ "View Full Debrief" button

8. AI DEBRIEF
   └─ Personalized analysis (5 sections)
   └─ "Replay Simulation" or "Try Next Module"

9. UPGRADE PROMPT (for free users)
   └─ "Unlock all 7 modules for $79/month"
   └─ Stripe checkout flow
```

## Flow 2: Individual Professional — Dashboard & Progress

```
1. USER DASHBOARD (/dashboard)
   ├── Completed Simulations
   │   └─ List with scores, dates, grades
   ├── In-Progress Sessions
   │   └─ Resume button
   ├── Skill Radar Chart
   │   └─ Aggregate scores across all 5 dimensions
   ├── Assigned Simulations (if enterprise participant)
   │   └─ Due dates, status
   └── Recommended Next
       └─ Based on lowest scoring dimensions
```

## Flow 3: Enterprise Admin — Onboarding & Team Management

```
1. ENTERPRISE SIGN-UP
   └─ Sales-assisted or self-serve pilot purchase
   └─ Stripe checkout for pilot/standard/enterprise plan
   └─ Admin account created with role: enterprise_admin

2. ORGANIZATION SETUP
   └─ Org name, logo
   └─ Department creation (optional)
   └─ SSO configuration (enterprise plan only)

3. INVITE MEMBERS
   └─ Email invite list (bulk CSV or individual)
   └─ Assign department
   └─ Invited users receive email → sign up → auto-join org

4. ASSIGN SIMULATIONS
   └─ Select simulation from catalog
   └─ Select members or departments
   └─ Set due date (optional)
   └─ Members receive notification

5. ENTERPRISE DASHBOARD (/org/dashboard)
   ├── Seat Usage
   │   └─ X of Y seats used
   ├── Assignment Progress
   │   └─ % completed, % in progress, % not started
   ├── Team Scores
   │   └─ Average scores by department
   │   └─ Risk heatmap (lowest scoring dimensions)
   ├── Individual Detail
   │   └─ Click member → see their scores and sessions
   └── Export Reports
       └─ Download PDF or CSV of analytics
```

## Flow 4: Simulation Player — Detailed Interaction

```
SIMULATION PLAYER SCREEN LAYOUT (16:9)

┌────────────────────────────────────────────────────────┐
│                                                         │
│                   VIDEO VIEWPORT                        │
│               (scene plays here)                        │
│                                                         │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Option A  │  │ Option B  │  │ Option C  │   ⏱ 0:47  │
│  │           │  │           │  │           │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  📄 View Documents    👥 Stakeholder Profiles           │
│                                                         │
└────────────────────────────────────────────────────────┘

INTERACTIONS:
- Click option card → highlight selection
- Click "Confirm Decision" → submit choice
- Timer runs out → auto-selects "no decision" (worst outcome)
- Click Documents → modal with context docs (emails, reports)
- Click Stakeholders → side panel with NPC profiles
```

## Flow 5: Platform Admin — Content Management

```
1. ADMIN CMS (/admin)
   └─ Login with platform_admin role

2. SIMULATION LIST
   └─ All simulations: draft, review, staged, published, archived
   └─ Create New Simulation button

3. CREATE/EDIT SIMULATION
   ├── Metadata
   │   └─ Title, description, category, difficulty, tags, thumbnail
   ├── Scoring Config
   │   └─ Set dimension weights (must sum to 1.0)
   ├── Modules
   │   └─ Create/edit modules
   │   └─ Set narrative context, stakeholders
   ├── Decision Nodes (per module)
   │   └─ Create nodes with prompt text, timer, video
   │   └─ Add options with labels, descriptions, score impacts
   │   └─ Link nodes (set next_node_key)
   ├── Media Upload
   │   └─ Upload video, images, audio
   │   └─ Assign to nodes and options
   └── AI Prompts
       └─ Configure dialogue and debrief prompt templates

4. VALIDATION & PUBLISH
   └─ Run automated validation (see 15_SIMULATION_SCHEMA.md checklist)
   └─ Fix any errors
   └─ Publish to staged → test → publish to production
```

## Flow 6: Free Demo Funnel

```
LANDING PAGE
  └─ "Try Free — No Sign Up Required" (optional anonymous demo)
  └─ OR "Sign Up Free" → create account → play Module 1 Act 1

ANONYMOUS DEMO (no account needed)
  └─ Plays first 2 decision nodes of Module 1
  └─ Shows partial scorecard
  └─ CTA: "Sign up to see your full results and continue"
  └─ Creates account → converts to free tier

FREE TIER
  └─ Full Module 1 (Activist Investor Showdown)
  └─ Full scorecard + AI debrief
  └─ Catalog visible but other modules locked
  └─ CTA: "Upgrade to Pro for all modules"

PRO TIER
  └─ All published modules unlocked
  └─ Full dashboard and progress tracking
```

## Screen Inventory (Phase 1)

| Screen | Route | Auth Required |
|--------|-------|---------------|
| Landing page | `/` | No |
| Sign up / Login | `/sign-in`, `/sign-up` | No (Clerk hosted) |
| Simulation catalog | `/simulations` | Yes |
| Simulation detail | `/simulations/:slug` | Yes |
| Module briefing | `/simulations/:slug/:module` | Yes (subscription check) |
| Simulation player | `/play/:sessionId` | Yes (session owner) |
| Scorecard | `/play/:sessionId/results` | Yes |
| Debrief | `/play/:sessionId/debrief` | Yes |
| User dashboard | `/dashboard` | Yes |
| Upgrade / Pricing | `/pricing` | No |
| Enterprise dashboard | `/org/dashboard` | Enterprise admin |
| Enterprise analytics | `/org/analytics` | Enterprise admin |
| Admin CMS | `/admin` | Platform admin |
| Admin simulation editor | `/admin/simulations/:id` | Platform admin |
