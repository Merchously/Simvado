import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Reference — Simvado",
  description: "Complete Game Engine API reference for Simvado.",
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-2 rounded-lg bg-surface-overlay p-4 text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

export default function ApiReferencePage() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/docs"
          className="text-sm text-text-muted hover:text-text-primary transition"
        >
          &larr; Docs
        </Link>
        <h1 className="mt-4 text-4xl font-bold">API Reference</h1>
        <p className="mt-2 text-text-secondary">
          Base URL: <code className="text-brand-400">https://simvado.com</code>
        </p>

        {/* Auth */}
        <div className="mt-12 space-y-10">
          <div>
            <h2 className="text-2xl font-semibold" id="authentication">
              Authentication
            </h2>
            <p className="mt-2 text-text-secondary">
              All Game Engine API endpoints require a Bearer token. Generate API
              keys from the Simvado admin panel.
            </p>
            <CodeBlock>{`Authorization: Bearer sk_sim_<64-char-hex>`}</CodeBlock>
            <p className="mt-2 text-sm text-text-muted">
              Keys are SHA-256 hashed on storage. The plaintext key is shown
              only once at creation time.
            </p>
          </div>

          {/* Create Session */}
          <div>
            <h2 className="text-2xl font-semibold" id="create-session">
              Create Session
            </h2>
            <p className="mt-1 text-sm text-brand-400 font-mono">
              POST /api/game/sessions
            </p>
            <p className="mt-2 text-text-secondary">
              Create a new simulation session when a player starts.
            </p>
            <h3 className="mt-4 text-sm font-semibold text-text-secondary">
              Request Body
            </h3>
            <CodeBlock>
              {`{
  "userId": "uuid",           // Simvado user ID
  "moduleId": "uuid",         // Module to play
  "externalSessionId": "...", // Optional: your game engine's session ID
  "platform": "unreal"        // "unreal" | "unity" | "web" | "other"
}`}
            </CodeBlock>
            <h3 className="mt-4 text-sm font-semibold text-text-secondary">
              Response (201)
            </h3>
            <CodeBlock>
              {`{
  "sessionId": "uuid",
  "externalSessionId": "..."
}`}
            </CodeBlock>
          </div>

          {/* Report Events */}
          <div>
            <h2 className="text-2xl font-semibold" id="report-events">
              Report Events
            </h2>
            <p className="mt-1 text-sm text-brand-400 font-mono">
              POST /api/game/sessions/:id/events
            </p>
            <p className="mt-2 text-text-secondary">
              Send gameplay events during a session. Supports single events or
              batches.
            </p>
            <h3 className="mt-4 text-sm font-semibold text-text-secondary">
              Request Body (single)
            </h3>
            <CodeBlock>
              {`{
  "eventType": "decision",  // "decision" | "milestone" | "score_update" | "completion" | "custom"
  "eventData": {
    "choice": "Accept merger offer",
    "context": "Board meeting Q3"
  },
  "timestamp": "2025-03-15T10:30:00Z"  // Optional, defaults to now
}`}
            </CodeBlock>
            <h3 className="mt-4 text-sm font-semibold text-text-secondary">
              Request Body (batch)
            </h3>
            <CodeBlock>
              {`[
  { "eventType": "decision", "eventData": { ... } },
  { "eventType": "milestone", "eventData": { ... } }
]`}
            </CodeBlock>
            <h3 className="mt-4 text-sm font-semibold text-text-secondary">
              Response (201)
            </h3>
            <CodeBlock>{`{ "eventIds": ["uuid", "uuid"] }`}</CodeBlock>
          </div>

          {/* Get Events */}
          <div>
            <h2 className="text-2xl font-semibold" id="get-events">
              Get Session Events
            </h2>
            <p className="mt-1 text-sm text-brand-400 font-mono">
              GET /api/game/sessions/:id/events
            </p>
            <p className="mt-2 text-text-secondary">
              Retrieve all events for a session.
            </p>
            <h3 className="mt-4 text-sm font-semibold text-text-secondary">
              Response (200)
            </h3>
            <CodeBlock>
              {`{
  "events": [
    {
      "id": "uuid",
      "eventType": "decision",
      "eventData": { ... },
      "timestamp": "2025-03-15T10:30:00Z"
    }
  ]
}`}
            </CodeBlock>
          </div>

          {/* Complete Session */}
          <div>
            <h2 className="text-2xl font-semibold" id="complete-session">
              Complete Session
            </h2>
            <p className="mt-1 text-sm text-brand-400 font-mono">
              POST /api/game/sessions/:id/complete
            </p>
            <p className="mt-2 text-text-secondary">
              End a session with final scores. This triggers AI debrief
              generation automatically.
            </p>
            <h3 className="mt-4 text-sm font-semibold text-text-secondary">
              Request Body
            </h3>
            <CodeBlock>
              {`{
  "finalScores": {
    "financial": 78,
    "reputational": 85,
    "ethical": 92,
    "stakeholder_confidence": 70,
    "long_term_stability": 81,
    "total": 81
  },
  "totalDurationSeconds": 1440,
  "summary": "Optional game engine summary text"
}`}
            </CodeBlock>
            <h3 className="mt-4 text-sm font-semibold text-text-secondary">
              Response (200)
            </h3>
            <CodeBlock>
              {`{
  "status": "completed",
  "debriefGenerated": true
}`}
            </CodeBlock>
          </div>

          {/* Event Types */}
          <div>
            <h2 className="text-2xl font-semibold" id="event-types">
              Event Types
            </h2>
            <div className="mt-4 space-y-3">
              {[
                {
                  type: "decision",
                  desc: "Player made a narrative choice or strategic decision",
                },
                {
                  type: "milestone",
                  desc: "Player reached a narrative checkpoint or key moment",
                },
                {
                  type: "score_update",
                  desc: "Interim score recalculation during gameplay",
                },
                {
                  type: "completion",
                  desc: "Session ended (auto-created by complete endpoint)",
                },
                {
                  type: "custom",
                  desc: "Game-specific data not covered by other types",
                },
              ].map(({ type, desc }) => (
                <div
                  key={type}
                  className="flex items-start gap-4 text-sm"
                >
                  <code className="text-brand-400 font-mono shrink-0">
                    {type}
                  </code>
                  <span className="text-text-muted">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Errors */}
          <div>
            <h2 className="text-2xl font-semibold" id="errors">
              Error Responses
            </h2>
            <CodeBlock>{`{ "error": "Human-readable error message" }`}</CodeBlock>
            <div className="mt-4 space-y-2 text-sm">
              {[
                { code: "400", desc: "Bad request — invalid or missing fields" },
                { code: "401", desc: "Unauthorized — missing or invalid API key" },
                { code: "404", desc: "Not found — session or resource missing" },
                { code: "429", desc: "Rate limited — too many requests" },
              ].map(({ code, desc }) => (
                <div key={code} className="flex gap-4">
                  <code className="text-brand-400 font-mono">{code}</code>
                  <span className="text-text-muted">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rate limits */}
          <div>
            <h2 className="text-2xl font-semibold" id="rate-limits">
              Rate Limits
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex gap-4">
                <span className="text-text-secondary font-medium w-48">
                  Game Engine API
                </span>
                <span className="text-text-muted">
                  500 requests/minute per API key
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-secondary font-medium w-48">
                  AI Debrief (complete)
                </span>
                <span className="text-text-muted">
                  20 requests/minute per key
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
