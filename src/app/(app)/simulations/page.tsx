import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Simulations — Simvado" };

export default async function SimulationsPage() {
  const simulations = await db.simulation.findMany({
    where: { status: "published" },
    include: {
      modules: {
        where: { status: "published" },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Simulations</h1>
        <p className="mt-1 text-text-secondary">
          Choose a simulation and start practicing real decisions.
        </p>
      </div>

      {simulations.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-16 text-center">
          <p className="text-4xl mb-4">🎬</p>
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="mt-2 text-text-muted max-w-md mx-auto">
            Our first simulation — Boardroom Under Pressure — is currently in
            production. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim) => (
            <Link
              key={sim.id}
              href={`/simulations/${sim.slug}`}
              className="group rounded-2xl border border-border-subtle bg-surface-raised overflow-hidden hover:border-brand-600/50 transition"
            >
              {/* Thumbnail placeholder */}
              <div className="aspect-video bg-surface-overlay flex items-center justify-center">
                <span className="text-4xl">🎬</span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-medium">
                    {sim.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-overlay text-text-muted font-medium capitalize">
                    {sim.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-brand-300 transition">
                  {sim.title}
                </h3>
                <p className="mt-1 text-sm text-text-muted line-clamp-2">
                  {sim.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                  <span>{sim.modules.length} modules</span>
                  {sim.estimatedDurationMin && (
                    <span>{sim.estimatedDurationMin} min</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
