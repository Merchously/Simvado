import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sim = await db.simulation.findUnique({ where: { slug } });
  return { title: sim ? `${sim.title} — Simvado` : "Not Found" };
}

export default async function SimulationDetailPage({ params }: Props) {
  const { slug } = await params;

  const [simulation, user] = await Promise.all([
    db.simulation.findUnique({
      where: { slug, status: "published" },
      include: {
        modules: {
          where: { status: "published" },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    currentUser(),
  ]);

  if (!simulation) notFound();

  const dbUser = user
    ? await db.user.findUnique({ where: { clerkId: user.id } })
    : null;
  const tier = dbUser?.subscriptionTier ?? "free";
  const hasFullAccess = tier !== "free";

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <Link
          href="/simulations"
          className="text-sm text-text-muted hover:text-text-primary transition"
        >
          &larr; All Simulations
        </Link>
        <h1 className="mt-4 text-4xl font-bold">{simulation.title}</h1>
        <p className="mt-2 text-text-secondary">{simulation.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 font-medium">
            {simulation.category}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-surface-overlay text-text-muted font-medium capitalize">
            {simulation.difficulty}
          </span>
          {simulation.estimatedDurationMin && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface-overlay text-text-muted font-medium">
              {simulation.estimatedDurationMin} min
            </span>
          )}
        </div>
      </div>

      {/* Scoring dimensions */}
      <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
        <h2 className="text-lg font-semibold mb-4">Scoring Dimensions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            "Financial Impact",
            "Reputational Risk",
            "Ethical Integrity",
            "Stakeholder Confidence",
            "Long-term Stability",
          ].map((dim) => (
            <div
              key={dim}
              className="text-center p-3 rounded-lg bg-surface-overlay"
            >
              <p className="text-xs text-text-muted">{dim}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Modules</h2>
        <div className="space-y-3">
          {simulation.modules.map((mod, i) => {
            const locked = !hasFullAccess && !mod.isFreeDemo;
            return (
              <div
                key={mod.id}
                className={`flex items-center justify-between rounded-xl border p-5 ${
                  locked
                    ? "border-border-subtle/50 bg-surface-raised/50 opacity-70"
                    : "border-border-subtle bg-surface-raised"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-text-muted w-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-medium">{mod.title}</p>
                    {mod.estimatedDurationMin && (
                      <p className="text-xs text-text-muted">
                        {mod.estimatedDurationMin} min
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {mod.isFreeDemo && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium">
                      Free
                    </span>
                  )}
                  {locked && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">
                      Pro
                    </span>
                  )}
                  {mod.platform && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-overlay text-text-muted capitalize">
                      {mod.platform}
                    </span>
                  )}
                  {locked ? (
                    <Link
                      href="/settings/billing"
                      className="text-sm px-4 py-2 rounded-lg border border-brand-600/50 text-brand-400 font-medium hover:bg-brand-600/10 transition"
                    >
                      Upgrade
                    </Link>
                  ) : mod.launchUrl ? (
                    <a
                      href={mod.launchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition"
                    >
                      Launch
                    </a>
                  ) : (
                    <span className="text-sm px-4 py-2 rounded-lg bg-surface-overlay text-text-muted font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade banner for free users */}
      {!hasFullAccess && (
        <div className="rounded-xl border border-brand-600/30 bg-surface-raised p-6 text-center">
          <p className="font-semibold">
            Upgrade to Pro for full access to all modules
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Unlimited replays, full debrief history, and priority new releases.
          </p>
          <Link
            href="/settings/billing"
            className="mt-3 inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}
    </div>
  );
}
