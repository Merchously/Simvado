"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  members: { id: string; label: string }[];
  simulations: { id: string; label: string }[];
}

export default function AssignmentForm({ slug, members, simulations }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [simId, setSimId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/org/${slug}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignedToUserId: userId,
        simulationId: simId,
        dueDate: dueDate || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setUserId("");
    setSimId("");
    setDueDate("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border-subtle bg-surface-raised p-4"
    >
      <h3 className="text-sm font-semibold mb-3">Create Assignment</h3>
      <div className="flex flex-wrap gap-3">
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none"
        >
          <option value="">Select member...</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={simId}
          onChange={(e) => setSimId(e.target.value)}
          required
          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none"
        >
          <option value="">Select simulation...</option>
          {simulations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? "Assigning..." : "Assign"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}
