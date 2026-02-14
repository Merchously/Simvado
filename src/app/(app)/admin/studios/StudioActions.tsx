"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudioActions({ studioId }: { studioId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(status: "approved" | "rejected" | "suspended") {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/studios/${studioId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Action failed");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction("approved")}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-50"
      >
        Reject
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
