import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin — Simvado" };

export default async function AdminDashboardPage() {
  const [userCount, simCount, sessionCount, apiKeyCount, recentSessions] =
    await Promise.all([
      db.user.count(),
      db.simulation.count(),
      db.session.count(),
      db.apiKey.count({ where: { isActive: true } }),
      db.session.findMany({
        include: {
          user: { select: { name: true, email: true } },
          module: {
            select: { title: true, simulation: { select: { title: true } } },
          },
        },
        orderBy: { startedAt: "desc" },
        take: 10,
      }),
    ]);

  const stats = [
    { label: "Users", value: userCount },
    { label: "Simulations", value: simCount },
    { label: "Sessions", value: sessionCount },
    { label: "Active API Keys", value: apiKeyCount },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="mt-1 text-text-secondary">Admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border-subtle bg-surface-raised p-6"
          >
            <p className="text-sm text-text-muted">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <p className="text-text-muted">No sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
              >
                <div>
                  <p className="font-medium">
                    {s.user?.name ?? s.user?.email ?? "Unknown user"}
                  </p>
                  <p className="text-sm text-text-muted">
                    {s.module.simulation.title} &mdash; {s.module.title}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    s.status === "completed"
                      ? "bg-green-500/10 text-green-400"
                      : s.status === "in_progress"
                        ? "bg-brand-500/10 text-brand-400"
                        : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {s.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
