"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewActions({ simulationId }: { simulationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  async function handleApprove() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/reviews/${simulationId}/approve`, {
      method: "POST",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to approve");
      setLoading(false);
      return;
    }

    router.push("/admin/reviews");
  }

  async function handleReject() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/reviews/${simulationId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewNotes }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to reject");
      setLoading(false);
      return;
    }

    router.push("/admin/reviews");
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Approve & Publish"}
        </button>
        <button
          onClick={() => setShowReject(!showReject)}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {showReject && (
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-3">
          <label className="block text-sm font-medium">
            Review Notes (sent to studio)
          </label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
            placeholder="Explain why this simulation is being rejected and what changes are needed..."
            className="w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleReject}
            disabled={loading || !reviewNotes.trim()}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Rejection"}
          </button>
        </div>
      )}
    </div>
  );
}
