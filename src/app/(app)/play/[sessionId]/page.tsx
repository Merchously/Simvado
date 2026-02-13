"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

type Option = {
  id: string;
  optionKey: string;
  label: string;
  description: string;
};

type NodeData = {
  nodeKey: string;
  promptText: string;
  timerSeconds: number | null;
  preVideoUrl: string | null;
  contextDocuments: { title: string; type: string; contentMarkdown: string }[];
  options: Option[];
};

type DecideResponse = {
  consequenceVideoUrl: string | null;
  aiDialogue: string | null;
  runningScores: Record<string, number>;
  nextNodeKey: string | null;
  isComplete: boolean;
};

export default function SimulationPlayerPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [node, setNode] = useState<NodeData | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [consequence, setConsequence] = useState<DecideResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  // Fetch current decision node
  const fetchNode = useCallback(async () => {
    setLoading(true);
    setConsequence(null);
    setSelected(null);
    try {
      const res = await fetch(`/api/sessions/${params.sessionId}/node`);
      if (!res.ok) throw new Error("Failed to load node");
      const data = await res.json();
      setNode(data);
      setTimeLeft(data.timerSeconds);
    } catch {
      /* handle error */
    } finally {
      setLoading(false);
    }
  }, [params.sessionId]);

  useEffect(() => {
    fetchNode();
  }, [fetchNode]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Submit decision
  async function handleDecide() {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${params.sessionId}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId: selected,
          timeSpentSeconds: node?.timerSeconds
            ? (node.timerSeconds - (timeLeft ?? 0))
            : 0,
        }),
      });
      const data: DecideResponse = await res.json();
      setConsequence(data);

      if (data.isComplete) {
        setTimeout(
          () => router.push(`/play/${params.sessionId}/results`),
          3000
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface">
        <div className="animate-pulse text-text-muted">Loading scenario...</div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface">
        <p className="text-text-muted">Session not found.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-surface flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-surface/90">
        <span className="text-sm font-mono text-text-muted">
          {node.nodeKey.replace("_", " ").toUpperCase()}
        </span>
        {timeLeft !== null && (
          <span
            className={`text-lg font-mono font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-text-primary"}`}
          >
            {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        {/* Consequence display */}
        {consequence ? (
          <div className="max-w-2xl text-center space-y-6 animate-fade-in">
            {consequence.aiDialogue && (
              <blockquote className="text-lg italic text-text-secondary border-l-2 border-brand-600 pl-4 text-left">
                {consequence.aiDialogue}
              </blockquote>
            )}
            {!consequence.isComplete && (
              <button
                onClick={fetchNode}
                className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition"
              >
                Next Decision
              </button>
            )}
            {consequence.isComplete && (
              <p className="text-brand-400 font-medium">
                Simulation complete. Loading results...
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Prompt */}
            <div className="max-w-3xl text-center mb-10">
              <p className="text-xl md:text-2xl font-medium leading-relaxed">
                {node.promptText}
              </p>
            </div>

            {/* Context documents toggle */}
            {node.contextDocuments && node.contextDocuments.length > 0 && (
              <button
                onClick={() => setShowDocs(!showDocs)}
                className="mb-6 text-sm text-brand-400 hover:text-brand-300 transition"
              >
                {showDocs ? "Hide" : "View"} supporting documents (
                {node.contextDocuments.length})
              </button>
            )}

            {showDocs && (
              <div className="max-w-2xl w-full mb-8 space-y-3">
                {node.contextDocuments.map((doc, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border-subtle bg-surface-raised p-4"
                  >
                    <p className="text-xs text-brand-400 font-medium uppercase">
                      {doc.type}
                    </p>
                    <p className="text-sm font-semibold mt-1">{doc.title}</p>
                    <p className="text-sm text-text-muted mt-2 whitespace-pre-wrap">
                      {doc.contentMarkdown}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Decision options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
              {node.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`text-left p-5 rounded-xl border transition ${
                    selected === opt.id
                      ? "border-brand-500 bg-brand-600/10"
                      : "border-border-subtle bg-surface-raised hover:border-border-default"
                  }`}
                >
                  <span className="text-xs font-mono text-brand-400">
                    {opt.optionKey}
                  </span>
                  <p className="mt-1 font-semibold">{opt.label}</p>
                  <p className="mt-1 text-sm text-text-muted">
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Confirm button */}
            <button
              onClick={handleDecide}
              disabled={!selected || submitting}
              className="mt-8 px-10 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition"
            >
              {submitting ? "Submitting..." : "Confirm Decision"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
