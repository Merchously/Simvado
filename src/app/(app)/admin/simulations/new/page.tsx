"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSimulationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    skillTags: "",
    difficulty: "intermediate" as string,
    format: "unreal_3d" as string,
    estimatedDurationMin: 60,
    thumbnailUrl: "",
  });

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function updateField(field: string, value: string | number) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !prev.slug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      ...form,
      skillTags: form.skillTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const res = await fetch("/api/admin/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create simulation");
      setSaving(false);
      return;
    }

    router.push("/admin/simulations");
  }

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">New Simulation</h1>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className={inputClass}
            rows={3}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              className={inputClass}
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              placeholder="Executive Leadership"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Skill Tags (comma-separated)
            </label>
            <input
              className={inputClass}
              value={form.skillTags}
              onChange={(e) => updateField("skillTags", e.target.value)}
              placeholder="Governance, Risk Management"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              className={inputClass}
              value={form.difficulty}
              onChange={(e) => updateField("difficulty", e.target.value)}
            >
              <option value="foundational">Foundational</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="executive">Executive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select
              className={inputClass}
              value={form.format}
              onChange={(e) => updateField("format", e.target.value)}
            >
              <option value="unreal_3d">Unreal 3D</option>
              <option value="unity_3d">Unity 3D</option>
              <option value="branching_narrative">Branching Narrative</option>
              <option value="realtime_crisis">Realtime Crisis</option>
              <option value="ai_adaptive">AI Adaptive</option>
              <option value="multiplayer_board">Multiplayer Board</option>
              <option value="external_custom">External Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (min)
            </label>
            <input
              type="number"
              className={inputClass}
              value={form.estimatedDurationMin}
              onChange={(e) =>
                updateField("estimatedDurationMin", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Thumbnail URL
          </label>
          <input
            className={inputClass}
            value={form.thumbnailUrl}
            onChange={(e) => updateField("thumbnailUrl", e.target.value)}
            placeholder="https://cdn.simvado.com/..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium transition"
          >
            {saving ? "Creating..." : "Create Simulation"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/simulations")}
            className="px-6 py-2.5 rounded-xl border border-border-subtle text-sm font-medium transition hover:bg-surface-raised"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
