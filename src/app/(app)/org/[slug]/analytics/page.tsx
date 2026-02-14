import type { Metadata } from "next";
import Link from "next/link";
import { requireOrgAdmin } from "@/lib/org";
import { db } from "@/lib/db";
import ScoreRadarChart from "@/components/charts/ScoreRadarChart";
import CompletionRateChart from "@/components/charts/CompletionRateChart";

export const metadata: Metadata = { title: "Analytics — Simvado" };

const DIMENSION_LABELS: Record<string, string> = {
  financial: "Financial",
  reputational: "Reputational",
  ethical: "Ethical",
  stakeholder_confidence: "Stakeholder",
  long_term_stability: "Stability",
};

type Props = { params: Promise<{ slug: string }> };

export default async function OrgAnalyticsPage({ params }: Props) {
  const { slug } = await params;
  const { org } = await requireOrgAdmin(slug);

  const sessions = await db.session.findMany({
    where: { organizationId: org.id },
    select: { status: true, finalScores: true },
  });

  const completed = sessions.filter((s) => s.status === "completed");
  const totalCount = sessions.length;
  const completedCount = completed.length;

  // Org average scores
  const dimensionKeys = Object.keys(DIMENSION_LABELS);
  const orgAvgs: Record<string, number> = {};
  for (const key of dimensionKeys) {
    const values = completed
      .map((s) => ((s.finalScores as Record<string, number>) ?? {})[key])
      .filter((v): v is number => typeof v === "number");
    orgAvgs[key] =
      values.length > 0
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;
  }

  // Platform averages for comparison
  const allCompleted = await db.session.findMany({
    where: { status: "completed" },
    select: { finalScores: true },
  });
  const platformAvgs: Record<string, number> = {};
  for (const key of dimensionKeys) {
    const values = allCompleted
      .map((s) => ((s.finalScores as Record<string, number>) ?? {})[key])
      .filter((v): v is number => typeof v === "number");
    platformAvgs[key] =
      values.length > 0
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;
  }

  const radarData = dimensionKeys.map((key) => ({
    dimension: DIMENSION_LABELS[key],
    score: orgAvgs[key],
    average: platformAvgs[key],
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Team Analytics</h2>
        <Link
          href={`/api/org/${slug}/analytics/export`}
          className="px-4 py-2 rounded-lg border border-border-default text-sm font-medium text-text-secondary hover:text-text-primary transition"
        >
          Export CSV
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CompletionRateChart completed={completedCount} total={totalCount} />
        <ScoreRadarChart data={radarData} />
      </div>

      {/* Score summary table */}
      <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
        <h3 className="font-semibold mb-4">Average Scores</h3>
        <div className="space-y-3">
          {dimensionKeys.map((key) => (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">
                  {DIMENSION_LABELS[key]}
                </span>
                <span className="font-medium">{orgAvgs[key]}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-overlay overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-700"
                  style={{ width: `${orgAvgs[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
