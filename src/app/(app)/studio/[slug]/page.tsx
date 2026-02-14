import type { Metadata } from "next";
import { requireStudioMember } from "@/lib/studio";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Studio Dashboard — Simvado" };

type Props = { params: Promise<{ slug: string }> };

export default async function StudioDashboardPage({ params }: Props) {
  const { slug } = await params;
  const { studio } = await requireStudioMember(slug);

  const [totalSims, publishedSims, reviewSims, earningsAgg] =
    await Promise.all([
      db.simulation.count({ where: { studioId: studio.id } }),
      db.simulation.count({
        where: { studioId: studio.id, status: "published" },
      }),
      db.simulation.count({
        where: { studioId: studio.id, status: "review" },
      }),
      db.studioEarning.aggregate({
        where: { studioId: studio.id },
        _sum: { studioAmount: true },
      }),
    ]);

  const totalEarnings = earningsAgg._sum.studioAmount?.toNumber() ?? 0;

  const recentSessions = await db.session.findMany({
    where: {
      module: { simulation: { studioId: studio.id } },
    },
    include: {
      user: { select: { name: true, email: true } },
      module: { include: { simulation: { select: { title: true } } } },
    },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Total Simulations", value: totalSims },
    { label: "Published", value: publishedSims },
    { label: "Pending Review", value: reviewSims },
    {
      label: "Total Earnings",
      value: `$${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Studio Dashboard</h1>
        <p className="text-text-secondary">
          Overview of your studio performance and activity
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border-subtle bg-surface-raised p-6"
          >
            <p className="text-sm text-text-muted">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {recentSessions.length === 0 ? (
          <p className="text-text-muted">
            No sessions on your simulations yet.
          </p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
              >
                <div>
                  <p className="font-medium">
                    {session.user.name || session.user.email} &middot;{" "}
                    {session.module.simulation.title}
                  </p>
                  <p className="text-sm text-text-muted">
                    {session.module.title}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">
                    {new Date(session.startedAt).toLocaleDateString()}
                  </span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
