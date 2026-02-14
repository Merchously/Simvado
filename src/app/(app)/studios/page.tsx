import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Studios — Simvado" };

export default async function StudiosPage() {
  const studios = await db.studio.findMany({
    where: { status: "approved" },
    include: {
      _count: { select: { simulations: { where: { status: "published" } } } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Studios</h1>
        <p className="mt-1 text-text-secondary">
          Discover simulation studios building immersive training experiences.
        </p>
      </div>

      {studios.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-16 text-center">
          <p className="text-4xl mb-4">🏢</p>
          <h2 className="text-xl font-semibold">No studios yet</h2>
          <p className="mt-2 text-text-muted max-w-md mx-auto">
            Interested in publishing your simulations on Simvado?
          </p>
          <Link
            href="/studio/apply"
            className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition"
          >
            Apply as a Studio
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => (
            <Link
              key={studio.id}
              href={`/studios/${studio.slug}`}
              className="group rounded-2xl border border-border-subtle bg-surface-raised p-6 hover:border-brand-600/50 transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 text-lg font-bold">
                  {studio.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-brand-300 transition">
                    {studio.name}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {studio._count.simulations} published simulation
                    {studio._count.simulations !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {studio.description && (
                <p className="text-sm text-text-muted line-clamp-2">
                  {studio.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
