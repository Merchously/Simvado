import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import ReviewActions from "./ReviewActions";

export const metadata: Metadata = { title: "Review Simulation — Admin — Simvado" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminReviewDetailPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;

  const simulation = await db.simulation.findUnique({
    where: { id },
    include: {
      studio: { select: { id: true, name: true, slug: true } },
      modules: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          platform: true,
          launchUrl: true,
          isFreeDemo: true,
          sortOrder: true,
          status: true,
        },
      },
    },
  });

  if (!simulation) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/reviews"
          className="text-sm text-text-muted hover:text-text-primary transition"
        >
          &larr; Back to Review Queue
        </Link>
        <h1 className="text-3xl font-bold mt-2">{simulation.title}</h1>
        <p className="mt-1 text-text-secondary">{simulation.description}</p>
      </div>

      {/* Simulation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-3">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
            Details
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">Category</dt>
              <dd>{simulation.category}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Difficulty</dt>
              <dd className="capitalize">{simulation.difficulty}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Format</dt>
              <dd>{simulation.format.replace(/_/g, " ")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Status</dt>
              <dd>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-500/10 text-yellow-400">
                  {simulation.status}
                </span>
              </dd>
            </div>
            {simulation.submittedAt && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Submitted</dt>
                <dd>{new Date(simulation.submittedAt).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </div>

        {simulation.studio && (
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-3">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
              Studio
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Name</dt>
                <dd>{simulation.studio.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Slug</dt>
                <dd className="font-mono text-text-muted">
                  /{simulation.studio.slug}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Scoring Config */}
      {simulation.scoringConfig && (
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-3">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
            Scoring Config
          </h2>
          <pre className="text-sm bg-surface rounded-lg p-4 overflow-x-auto border border-border-subtle">
            {JSON.stringify(simulation.scoringConfig, null, 2)}
          </pre>
        </div>
      )}

      {/* Modules */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">
          Modules ({simulation.modules.length})
        </h2>
        {simulation.modules.length === 0 ? (
          <p className="text-text-muted">No modules attached.</p>
        ) : (
          <div className="space-y-2">
            {simulation.modules.map((mod, i) => (
              <div
                key={mod.id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
              >
                <div>
                  <p className="font-medium">
                    {i + 1}. {mod.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                    {mod.platform && <span>{mod.platform}</span>}
                    {mod.launchUrl && (
                      <span className="truncate max-w-xs">{mod.launchUrl}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mod.isFreeDemo && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-brand-500/10 text-brand-400">
                      Free Demo
                    </span>
                  )}
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-500/10 text-gray-400">
                    {mod.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Review Notes */}
      {simulation.reviewNotes && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 space-y-2">
          <h2 className="text-sm font-semibold text-yellow-400">
            Previous Review Notes
          </h2>
          <p className="text-sm whitespace-pre-wrap">{simulation.reviewNotes}</p>
        </div>
      )}

      {/* Actions */}
      {simulation.status === "review" && (
        <ReviewActions simulationId={simulation.id} />
      )}
    </div>
  );
}
