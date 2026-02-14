"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Earning = {
  id: string;
  studioName: string;
  simulationTitle: string;
  grossAmount: string;
  studioAmount: string;
  platformAmount: string;
  status: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  invoiced: "bg-blue-500/10 text-blue-400",
  paid: "bg-green-500/10 text-green-400",
};

export default function EarningsActions({ earnings }: { earnings: Earning[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkUpdate = async (status: "invoiced" | "paid") => {
    if (selected.size === 0) return;
    setUpdating(true);
    await fetch("/api/admin/earnings/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ earningIds: [...selected], status }),
    });
    setSelected(new Set());
    setUpdating(false);
    router.refresh();
  };

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-text-muted">
            {selected.size} selected
          </span>
          <button
            onClick={() => bulkUpdate("invoiced")}
            disabled={updating}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50"
          >
            Mark as Invoiced
          </button>
          <button
            onClick={() => bulkUpdate("paid")}
            disabled={updating}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition disabled:opacity-50"
          >
            Mark as Paid
          </button>
        </div>
      )}

      {earnings.length === 0 ? (
        <p className="text-text-muted">No earnings recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {earnings.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-4 rounded-xl border border-border-subtle bg-surface-raised p-4"
            >
              <input
                type="checkbox"
                checked={selected.has(e.id)}
                onChange={() => toggle(e.id)}
                className="h-4 w-4 rounded border-border-subtle"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{e.studioName}</p>
                <p className="text-xs text-text-muted truncate">
                  {e.simulationTitle}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">${parseFloat(e.grossAmount).toFixed(2)}</p>
                <p className="text-xs text-text-muted">
                  Studio: ${parseFloat(e.studioAmount).toFixed(2)}
                </p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[e.status] ?? ""}`}
              >
                {e.status}
              </span>
              <span className="text-xs text-text-muted">
                {new Date(e.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
