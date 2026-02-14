"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateKeyForm({
  simulations,
}: {
  simulations: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "",
    simulationId: "",
    expiresAt: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        simulationId: form.simulationId || null,
        expiresAt: form.expiresAt || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to generate");
      setSaving(false);
      return;
    }

    const data = await res.json();
    setGeneratedKey(data.key);
    setSaving(false);
  }

  function handleDone() {
    setOpen(false);
    setGeneratedKey("");
    setForm({ name: "", simulationId: "", expiresAt: "" });
    setCopied(false);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition"
      >
        Generate New Key
      </button>
    );
  }

  if (generatedKey) {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 space-y-4">
        <p className="text-sm font-medium text-green-400">
          API key generated. Copy it now — it won&apos;t be shown again.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-surface-raised px-3 py-2 text-sm font-mono break-all border border-border-subtle">
            {generatedKey}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedKey);
              setCopied(true);
            }}
            className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition whitespace-nowrap"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button
          onClick={handleDone}
          className="px-4 py-2 rounded-lg border border-border-subtle text-sm transition hover:bg-surface-raised"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
      {error && (
        <p className="text-sm text-red-400 mb-3">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className={inputClass}
          placeholder="Key name (e.g. Unreal Engine - BUP)"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            className={inputClass}
            value={form.simulationId}
            onChange={(e) =>
              setForm((p) => ({ ...p, simulationId: e.target.value }))
            }
          >
            <option value="">All simulations (no scope)</option>
            {simulations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <input
            type="date"
            className={inputClass}
            value={form.expiresAt}
            onChange={(e) =>
              setForm((p) => ({ ...p, expiresAt: e.target.value }))
            }
            placeholder="Expiry date (optional)"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium transition"
          >
            {saving ? "Generating..." : "Generate"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg border border-border-subtle text-sm transition hover:bg-surface-raised"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
