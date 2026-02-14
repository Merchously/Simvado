import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Simulations — Simvado" };

export default async function SimulationsPage() {
  const user = await currentUser();
  const dbUser = user
    ? await db.user.findUnique({ where: { clerkId: user.id } })
    : null;

  const tier = dbUser?.subscriptionTier ?? "free";
  const hasFullAccess = tier !== "free";

  const simulations = await db.simulation.findMany({
    where: { status: "published" },
    include: {
      modules: {
        where: { status: "published" },
        orderBy: { sortOrder: "asc" },
      },
      studio: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  const visibleSims = hasFullAccess ? simulations : simulations.slice(0, 1);
  const lockedCount = simulations.length - visibleSims.length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Simulations</h1>
        <p className="mt-1 text-text-secondary">
          Browse the library and launch simulations built by industry experts.
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
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleSims.map((sim) => (
              <Link
                key={sim.id}
                href={`/simulations/${sim.slug}`}
                className="group rounded-2xl border border-border-subtle bg-surface-raised overflow-hidden hover:border-brand-600/50 transition"
              >
                <div className="aspect-video bg-surface-overlay relative overflow-hidden">
                  {sim.thumbnailUrl ? (
                    <Image
                      src={sim.thumbnailUrl}
                      alt={sim.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}
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
                  {sim.studio && (
                    <p className="text-xs text-text-muted mt-0.5">
                      By {sim.studio.name}
                    </p>
                  )}
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

          {lockedCount > 0 && (
            <div className="rounded-2xl border border-brand-600/30 bg-surface-raised p-8 text-center">
              <p className="text-lg font-semibold">
                {lockedCount} more simulation{lockedCount > 1 ? "s" : ""} available with Pro
              </p>
              <p className="mt-2 text-sm text-text-muted max-w-md mx-auto">
                Upgrade to Pro for unlimited access to the entire simulation
                library, unlimited replays, and full debrief history.
              </p>
              <Link
                href="/settings/billing"
                className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition"
              >
                Upgrade to Pro
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
