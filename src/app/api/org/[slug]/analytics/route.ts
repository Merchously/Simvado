import { NextResponse } from "next/server";
import { requireOrgAdminApi } from "@/lib/org";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [memberCount, sessions, assignments] = await Promise.all([
    db.orgMembership.count({ where: { organizationId: ctx.org.id } }),
    db.session.findMany({
      where: { organizationId: ctx.org.id },
      select: { status: true, finalScores: true },
    }),
    db.simulationAssignment.findMany({
      where: { organizationId: ctx.org.id },
      select: { status: true },
    }),
  ]);

  const completed = sessions.filter((s) => s.status === "completed");
  const completionRate =
    sessions.length > 0
      ? Math.round((completed.length / sessions.length) * 100)
      : 0;

  // Average scores across completed sessions
  const dimensionKeys = [
    "financial",
    "reputational",
    "ethical",
    "stakeholder_confidence",
    "long_term_stability",
  ];
  const avgScores: Record<string, number> = {};
  for (const key of dimensionKeys) {
    const values = completed
      .map((s) => ((s.finalScores as Record<string, number>) ?? {})[key])
      .filter((v): v is number => typeof v === "number");
    avgScores[key] =
      values.length > 0
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;
  }

  // Assignment status breakdown
  const assignmentBreakdown = {
    assigned: assignments.filter((a) => a.status === "assigned").length,
    in_progress: assignments.filter((a) => a.status === "in_progress").length,
    completed: assignments.filter((a) => a.status === "completed").length,
    overdue: assignments.filter((a) => a.status === "overdue").length,
  };

  return NextResponse.json({
    memberCount,
    totalSessions: sessions.length,
    completedSessions: completed.length,
    completionRate,
    avgScores,
    assignmentBreakdown,
  });
}
