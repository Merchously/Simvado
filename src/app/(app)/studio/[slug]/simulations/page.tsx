import type { Metadata } from "next";
import Link from "next/link";
import { requireStudioMember } from "@/lib/studio";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Simulations — Studio — Simvado" };

type Props = { params: Promise<{ slug: string }> };

const statusBadge: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400",
  review: "bg-yellow-500/10 text-yellow-400",
  published: "bg-green-500/10 text-green-400",
  archived: "bg-red-500/10 text-red-400",
  staged: "bg-blue-500/10 text-blue-400",
};

export default async function StudioSimulationsPage({ params }: Props) {
  const { slug } = await params;
  const { studio } = await requireStudioMember(slug);

  const simulations = await db.simulation.findMany({
    where: { studioId: studio.id },
    include: { _count: { select: { modules: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulations</h1>
          <p className="text-text-secondary">
            Manage your studio&apos;s simulation catalog
          </p>
        </div>
        <Link
          href={`/studio/${slug}/simulations/new`}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition"
        >
          New Simulation
        </Link>
      </div>

      {simulations.length === 0 ? (
        <p className="text-text-muted">
          No simulations yet. Create your first one to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/studio/${slug}/simulations/${sim.id}/edit`}
                    className="font-medium hover:text-brand-400 transition truncate"
                  >
                    {sim.title}
                  </Link>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[sim.status] ?? "bg-surface-overlay text-text-muted"}`}
                  >
                    {sim.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                  <span>{sim.category}</span>
                  <span>
                    {sim._count.modules}{" "}
                    {sim._count.modules === 1 ? "module" : "modules"}
                  </span>
                  <span>
                    Updated {new Date(sim.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {sim.status === "draft" && (
                  <SubmitForReviewButton slug={slug} simId={sim.id} />
                )}
                <Link
                  href={`/studio/${slug}/simulations/${sim.id}/edit`}
                  className="px-4 py-2 rounded-lg border border-border-subtle text-sm hover:bg-surface-raised transition"
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

/* ---------- Client island: Submit for Review ---------- */

function SubmitForReviewButton({
  slug,
  simId,
}: {
  slug: string;
  simId: string;
}) {
  // This is rendered inside a server component but delegates action to a form POST
  return (
    <form
      action={`/api/studio/${slug}/simulations/${simId}/submit`}
      method="POST"
    >
      <button
        type="submit"
        className="px-4 py-2 rounded-lg border border-brand-600 text-brand-400 text-sm hover:bg-brand-600/10 transition"
      >
        Submit for Review
      </button>
    </form>
  );
}
