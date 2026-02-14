import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard — Simvado" };

export default async function DashboardPage() {
  const user = await currentUser();

  const dbUser = user
    ? await db.user.findUnique({ where: { clerkId: user.id } })
    : null;

  const sessions = dbUser
    ? await db.session.findMany({
        where: { userId: dbUser.id },
        include: { module: { include: { simulation: true } } },
        orderBy: { startedAt: "desc" },
        take: 5,
      })
    : [];

  const completedCount = dbUser
    ? await db.session.count({
        where: { userId: dbUser.id, status: "completed" },
      })
    : 0;

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{dbUser?.name ? `, ${dbUser.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-text-secondary">
          Review your simulation results and analytics.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Completed</p>
          <p className="mt-1 text-3xl font-bold">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">In Progress</p>
          <p className="mt-1 text-3xl font-bold">
            {sessions.filter((s) => s.status === "in_progress").length}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Tier</p>
          <p className="mt-1 text-3xl font-bold capitalize">
            {dbUser?.subscriptionTier?.replace("_", " ") ?? "Free"}
          </p>
        </div>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Sessions</h2>
          <Link
            href="/simulations"
            className="text-sm text-brand-400 hover:text-brand-300 transition"
          >
            Browse all simulations &rarr;
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-12 text-center">
            <p className="text-text-muted">No sessions yet.</p>
            <Link
              href="/simulations"
              className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition"
            >
              Browse Simulations
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
              >
                <div>
                  <p className="font-medium">
                    {session.module.simulation.title}
                  </p>
                  <p className="text-sm text-text-muted">
                    {session.module.title}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      session.status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : session.status === "in_progress"
                          ? "bg-brand-500/10 text-brand-400"
                          : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {session.status.replace("_", " ")}
                  </span>
                  {session.status === "completed" && (
                    <Link
                      href={`/sessions/${session.id}/results`}
                      className="text-sm text-brand-400 hover:text-brand-300"
                    >
                      Results
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
