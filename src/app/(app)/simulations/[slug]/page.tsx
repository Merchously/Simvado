import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

async function MoreFromStudio({
  studioSlug,
  studioName,
  currentSimId,
}: {
  studioSlug: string;
  studioName: string;
  currentSimId: string;
}) {
  const otherSims = await db.simulation.findMany({
    where: {
      studio: { slug: studioSlug },
      status: "published",
      id: { not: currentSimId },
    },
    select: { id: true, slug: true, title: true, category: true, thumbnailUrl: true },
    take: 3,
  });

  if (otherSims.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
      <h2 className="text-lg font-semibold mb-4">
        More from{" "}
        <Link
          href={`/studios/${studioSlug}`}
          className="text-brand-400 hover:text-brand-300 transition"
        >
          {studioName}
        </Link>
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {otherSims.map((s) => (
          <Link
            key={s.id}
            href={`/simulations/${s.slug}`}
            className="rounded-lg bg-surface-overlay hover:bg-surface-overlay/70 transition overflow-hidden"
          >
            {s.thumbnailUrl && (
              <div className="relative aspect-video">
                <Image
                  src={s.thumbnailUrl}
                  alt={s.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            )}
            <div className="p-4">
              <p className="font-medium text-sm">{s.title}</p>
              <p className="text-xs text-text-muted mt-1">{s.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

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
        studio: { select: { name: true, slug: true } },
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
      {/* Hero Image */}
      {simulation.thumbnailUrl && (
        <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden">
          <Image
            src={simulation.thumbnailUrl}
            alt={simulation.title}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>
      )}

      {/* Header */}
      <div>
        <Link
          href="/simulations"
          className="text-sm text-text-muted hover:text-text-primary transition"
        >
          &larr; All Simulations
        </Link>
        <h1 className="mt-4 text-4xl font-bold">{simulation.title}</h1>
        {simulation.studio && (
          <p className="mt-1 text-sm text-text-muted">
            By{" "}
            <Link
              href={`/studios/${simulation.studio.slug}`}
              className="text-brand-400 hover:text-brand-300 transition"
            >
              {simulation.studio.name}
            </Link>
          </p>
        )}
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

      {/* More from this studio */}
      {simulation.studio && (
        <MoreFromStudio
          studioSlug={simulation.studio.slug}
          studioName={simulation.studio.name}
          currentSimId={simulation.id}
        />
      )}

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
