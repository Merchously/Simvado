import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Simulations — Admin — Simvado" };

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400",
  review: "bg-yellow-500/10 text-yellow-400",
  staged: "bg-blue-500/10 text-blue-400",
  published: "bg-green-500/10 text-green-400",
  archived: "bg-red-500/10 text-red-400",
};

export default async function AdminSimulationsPage() {
  const simulations = await db.simulation.findMany({
    include: { _count: { select: { modules: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Simulations</h1>
        <Link
          href="/admin/simulations/new"
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition"
        >
          New Simulation
        </Link>
      </div>

      {simulations.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-12 text-center">
          <p className="text-text-muted">No simulations yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
            >
              <div>
                <p className="font-medium">{sim.title}</p>
                <p className="text-sm text-text-muted">
                  /{sim.slug} &middot; {sim.category ?? "Uncategorized"} &middot;{" "}
                  {sim._count.modules} module{sim._count.modules !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[sim.status] ?? statusColors.draft}`}
                >
                  {sim.status}
                </span>
                <Link
                  href={`/admin/simulations/${sim.id}/edit`}
                  className="text-sm text-brand-400 hover:text-brand-300 transition"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
