import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import StudioActions from "./StudioActions";

export const metadata: Metadata = { title: "Studios — Admin — Simvado" };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-green-500/10 text-green-400",
  suspended: "bg-red-500/10 text-red-400",
  rejected: "bg-gray-500/10 text-gray-400",
};

export default async function AdminStudiosPage() {
  await requireAdmin();

  const studios = await db.studio.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { simulations: true, members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Studios</h1>
        <p className="mt-1 text-text-secondary">
          Manage studio applications and statuses
        </p>
      </div>

      {studios.length === 0 ? (
        <p className="text-text-muted">No studios yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {studios.map((studio) => (
            <div
              key={studio.id}
              className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{studio.name}</h3>
                  <p className="text-sm text-text-muted truncate">
                    {studio.owner.email}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                    statusColors[studio.status] ?? "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {studio.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span>{studio._count.simulations} sims</span>
                <span>{studio._count.members} members</span>
                <span>
                  {new Date(studio.createdAt).toLocaleDateString()}
                </span>
              </div>

              {studio.status === "pending" && (
                <StudioActions studioId={studio.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
