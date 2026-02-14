import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import EarningsActions from "./EarningsActions";

export const metadata: Metadata = { title: "Earnings — Admin — Simvado" };

export default async function AdminEarningsPage() {
  await requireAdmin();

  const [earnings, aggregates] = await Promise.all([
    db.studioEarning.findMany({
      include: {
        studio: { select: { id: true, name: true } },
        simulation: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.studioEarning.groupBy({
      by: ["status"],
      _sum: { studioAmount: true, platformAmount: true, grossAmount: true },
    }),
  ]);

  const totals = {
    pending: aggregates.find((a) => a.status === "pending")?._sum.grossAmount?.toString() ?? "0",
    invoiced: aggregates.find((a) => a.status === "invoiced")?._sum.grossAmount?.toString() ?? "0",
    paid: aggregates.find((a) => a.status === "paid")?._sum.grossAmount?.toString() ?? "0",
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="mt-1 text-text-secondary">
          Manage studio payouts and revenue tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Pending</p>
          <p className="mt-1 text-3xl font-bold text-yellow-400">
            ${parseFloat(totals.pending).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Invoiced</p>
          <p className="mt-1 text-3xl font-bold text-blue-400">
            ${parseFloat(totals.invoiced).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
          <p className="text-sm text-text-muted">Paid</p>
          <p className="mt-1 text-3xl font-bold text-green-400">
            ${parseFloat(totals.paid).toFixed(2)}
          </p>
        </div>
      </div>

      <EarningsActions
        earnings={earnings.map((e) => ({
          id: e.id,
          studioName: e.studio.name,
          simulationTitle: e.simulation.title,
          grossAmount: e.grossAmount.toString(),
          studioAmount: e.studioAmount.toString(),
          platformAmount: e.platformAmount.toString(),
          status: e.status,
          createdAt: e.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
