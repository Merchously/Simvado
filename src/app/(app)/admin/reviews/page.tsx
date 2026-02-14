import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Review Queue — Admin — Simvado" };

export default async function AdminReviewsPage() {
  await requireAdmin();

  const simulations = await db.simulation.findMany({
    where: { status: "review" },
    include: {
      studio: { select: { id: true, name: true, slug: true } },
      _count: { select: { modules: true } },
    },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Queue</h1>
        <p className="mt-1 text-text-secondary">
          Simulations awaiting review and approval
        </p>
      </div>

      {simulations.length === 0 ? (
        <p className="text-text-muted">No simulations pending review.</p>
      ) : (
        <div className="space-y-2">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{sim.title}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                  {sim.studio && <span>{sim.studio.name}</span>}
                  <span>{sim._count.modules} modules</span>
                  {sim.submittedAt && (
                    <span>
                      Submitted{" "}
                      {new Date(sim.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/admin/reviews/${sim.id}`}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition"
              >
                Review
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
