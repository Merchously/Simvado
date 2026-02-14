import type { Metadata } from "next";
import { requireOrgAdmin } from "@/lib/org";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Organization — Simvado" };

type Props = { params: Promise<{ slug: string }> };

export default async function OrgDashboardPage({ params }: Props) {
  const { slug } = await params;
  const { org } = await requireOrgAdmin(slug);

  const [memberCount, sessionCount, completedCount, assignmentCount] =
    await Promise.all([
      db.orgMembership.count({ where: { organizationId: org.id } }),
      db.session.count({ where: { organizationId: org.id } }),
      db.session.count({
        where: { organizationId: org.id, status: "completed" },
      }),
      db.simulationAssignment.count({ where: { organizationId: org.id } }),
    ]);

  const recentSessions = await db.session.findMany({
    where: { organizationId: org.id },
    include: {
      user: { select: { name: true } },
      module: { include: { simulation: { select: { title: true } } } },
    },
    orderBy: { startedAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Members</p>
          <p className="mt-1 text-3xl font-bold">{memberCount}</p>
          <p className="text-xs text-text-muted">/ {org.seatLimit} seats</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Sessions</p>
          <p className="mt-1 text-3xl font-bold">{sessionCount}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Completed</p>
          <p className="mt-1 text-3xl font-bold">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Assignments</p>
          <p className="mt-1 text-3xl font-bold">{assignmentCount}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Team Activity</h2>
        {recentSessions.length === 0 ? (
          <p className="text-text-muted">No team sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
              >
                <div>
                  <p className="font-medium">
                    {session.user.name ?? "Unknown"} &middot;{" "}
                    {session.module.simulation.title}
                  </p>
                  <p className="text-sm text-text-muted">
                    {session.module.title}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    session.status === "completed"
                      ? "bg-green-500/10 text-green-400"
                      : session.status === "in_progress"
                        ? "bg-brand-500/10 text-brand-400"
                        : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {session.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
