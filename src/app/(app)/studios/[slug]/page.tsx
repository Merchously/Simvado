import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const studio = await db.studio.findUnique({ where: { slug } });
  return { title: studio ? `${studio.name} — Simvado` : "Not Found" };
}

export default async function StudioProfilePage({ params }: Props) {
  const { slug } = await params;

  const studio = await db.studio.findUnique({
    where: { slug, status: "approved" },
  });

  if (!studio) notFound();

  const simulations = await db.simulation.findMany({
    where: { studioId: studio.id, status: "published" },
    include: {
      modules: {
        where: { status: "published" },
        select: { id: true },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <Link
          href="/studios"
          className="text-sm text-text-muted hover:text-text-primary transition"
        >
          &larr; All Studios
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 text-2xl font-bold">
            {studio.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{studio.name}</h1>
            {studio.websiteUrl && (
              <a
                href={studio.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-400 hover:text-brand-300 transition"
              >
                {studio.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
        {studio.description && (
          <p className="mt-4 text-text-secondary">{studio.description}</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Simulations ({simulations.length})
        </h2>

        {simulations.length === 0 ? (
          <p className="text-text-muted">
            No published simulations yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {simulations.map((sim) => (
              <Link
                key={sim.id}
                href={`/simulations/${sim.slug}`}
                className="group rounded-2xl border border-border-subtle bg-surface-raised overflow-hidden hover:border-brand-600/50 transition"
              >
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
    </div>
  );
}
