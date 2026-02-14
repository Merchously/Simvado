"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export default function GenerateKeyForm({
  studioSlug,
  simulations,
}: {
  studioSlug: string;
  simulations: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [simulationId, setSimulationId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    if (!name) return;
    setGenerating(true);
    setError("");
    const res = await fetch(`/api/studio/${studioSlug}/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        simulationId: simulationId || undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setGeneratedKey(data.key);
      setName("");
      setSimulationId("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to generate key");
    }
    setGenerating(false);
  };

  if (generatedKey) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 space-y-3">
        <p className="text-sm font-medium text-green-400">
          API Key Generated
        </p>
        <p className="text-xs text-text-muted">
          Copy this key now — it won&apos;t be shown again.
        </p>
        <code className="block p-3 rounded-lg bg-surface text-sm break-all font-mono">
          {generatedKey}
        </code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(generatedKey);
          }}
          className="px-4 py-2 rounded-lg border border-border-subtle text-sm hover:bg-surface-raised transition"
        >
          Copy to Clipboard
        </button>
        <button
          onClick={() => setGeneratedKey("")}
          className="ml-2 px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary transition"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-4">
      <p className="text-sm font-medium">Generate New Key</p>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <input
          className={inputClass}
          placeholder="Key name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className={inputClass}
          value={simulationId}
          onChange={(e) => setSimulationId(e.target.value)}
        >
          <option value="">All simulations</option>
          {simulations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={generate}
        disabled={!name || generating}
        className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition disabled:opacity-50"
      >
        {generating ? "Generating..." : "Generate Key"}
      </button>
    </div>
  );
}
