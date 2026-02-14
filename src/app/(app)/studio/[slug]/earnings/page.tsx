import { requireStudioMember } from "@/lib/studio";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  invoiced: "bg-blue-500/10 text-blue-400",
  paid: "bg-green-500/10 text-green-400",
};

export default async function StudioEarningsPage({ params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioMember(slug);

  const [earnings, aggregates] = await Promise.all([
    db.studioEarning.findMany({
      where: { studioId: ctx.studio.id },
      include: {
        simulation: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.studioEarning.groupBy({
      by: ["status"],
      where: { studioId: ctx.studio.id },
      _sum: { studioAmount: true },
    }),
  ]);

  const getTotal = (status: string) =>
    aggregates
      .find((a) => a.status === status)
      ?._sum.studioAmount?.toString() ?? "0";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="mt-1 text-text-secondary">
          Track your revenue from simulation completions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Pending</p>
          <p className="mt-1 text-3xl font-bold text-yellow-400">
            ${parseFloat(getTotal("pending")).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Invoiced</p>
          <p className="mt-1 text-3xl font-bold text-blue-400">
            ${parseFloat(getTotal("invoiced")).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Paid</p>
          <p className="mt-1 text-3xl font-bold text-green-400">
            ${parseFloat(getTotal("paid")).toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Earnings</h2>
        {earnings.length === 0 ? (
          <p className="text-text-muted">No earnings yet.</p>
        ) : (
          <div className="space-y-2">
            {earnings.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
              >
                <div>
                  <p className="font-medium text-sm">
                    {e.simulation.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${e.studioAmount.toString()}
                    </p>
                    <p className="text-xs text-text-muted">
                      of ${e.grossAmount.toString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[e.status] ?? ""}`}
                  >
                    {e.status}
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
