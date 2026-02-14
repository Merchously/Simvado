import type { Metadata } from "next";
import { requireOrgAdmin } from "@/lib/org";
import { db } from "@/lib/db";
import AssignmentForm from "./AssignmentForm";

export const metadata: Metadata = { title: "Assignments — Simvado" };

type Props = { params: Promise<{ slug: string }> };

export default async function AssignmentsPage({ params }: Props) {
  const { slug } = await params;
  const { org } = await requireOrgAdmin(slug);

  const [assignments, members, simulations] = await Promise.all([
    db.simulationAssignment.findMany({
      where: { organizationId: org.id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        simulation: { select: { id: true, title: true } },
      },
      orderBy: { assignedAt: "desc" },
    }),
    db.orgMembership.findMany({
      where: { organizationId: org.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.simulation.findMany({
      where: { status: "published" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const memberOptions = members.map((m) => ({
    id: m.user.id,
    label: m.user.name ?? m.user.email,
  }));

  const simOptions = simulations.map((s) => ({
    id: s.id,
    label: s.title,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Assignments</h2>

      <AssignmentForm
        slug={slug}
        members={memberOptions}
        simulations={simOptions}
      />

      {assignments.length === 0 ? (
        <p className="text-text-muted">No assignments yet.</p>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
            >
              <div>
                <p className="font-medium">
                  {a.assignedTo.name ?? a.assignedTo.email}
                </p>
                <p className="text-sm text-text-muted">{a.simulation.title}</p>
              </div>
              <div className="flex items-center gap-3">
                {a.dueDate && (
                  <span className="text-xs text-text-muted">
                    Due {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    a.status === "completed"
                      ? "bg-green-500/10 text-green-400"
                      : a.status === "overdue"
                        ? "bg-red-500/10 text-red-400"
                        : a.status === "in_progress"
                          ? "bg-brand-500/10 text-brand-400"
                          : "bg-surface-overlay text-text-muted"
                  }`}
                >
                  {a.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
