import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Results — Simvado" };

type Props = { params: Promise<{ sessionId: string }> };

const DIMENSION_LABELS: Record<string, string> = {
  financial: "Financial Impact",
  reputational: "Reputational Risk",
  ethical: "Ethical Integrity",
  stakeholder_confidence: "Stakeholder Confidence",
  long_term_stability: "Long-term Stability",
};

export default async function ResultsPage({ params }: Props) {
  const { sessionId } = await params;

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { module: { include: { simulation: true } } },
  });

  if (!session || session.status !== "completed") notFound();

  const scores = (session.finalScores as Record<string, number>) ?? {};

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm text-text-muted">Simulation Complete</p>
        <h1 className="mt-2 text-3xl font-bold">
          {session.module.simulation.title}
        </h1>
        <p className="text-text-secondary">{session.module.title}</p>
      </div>

      {/* Total score */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-28 w-28 rounded-full border-4 border-brand-600">
          <div>
            <p className="text-3xl font-bold">{scores.total ?? "—"}</p>
            <p className="text-xs text-text-muted">
              {scores.grade ?? ""}
            </p>
          </div>
        </div>
      </div>

      {/* Dimension scores */}
      <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-4">
        <h2 className="font-semibold">Score Breakdown</h2>
        {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
          const value = scores[key] ?? 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-overlay overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-700"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Debrief */}
      {session.debriefText && (
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <h2 className="font-semibold mb-4">AI Debrief</h2>
          <div className="prose prose-invert prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
            {session.debriefText}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/simulations"
          className="px-6 py-3 rounded-xl border border-border-default text-text-secondary hover:text-text-primary font-medium transition"
        >
          Browse Simulations
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
