"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Simulation {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  skillTags: string[];
  difficulty: string;
  format: string;
  status: string;
  estimatedDurationMin: number | null;
  thumbnailUrl: string | null;
  scoringConfig: unknown;
}

export default function SimulationForm({
  simulation,
}: {
  simulation: Simulation;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: simulation.title,
    slug: simulation.slug,
    description: simulation.description ?? "",
    category: simulation.category ?? "",
    skillTags: simulation.skillTags.join(", "),
    difficulty: simulation.difficulty,
    format: simulation.format,
    status: simulation.status,
    estimatedDurationMin: simulation.estimatedDurationMin ?? 60,
    thumbnailUrl: simulation.thumbnailUrl ?? "",
    scoringConfig: simulation.scoringConfig
      ? JSON.stringify(simulation.scoringConfig, null, 2)
      : "",
  });

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const body: Record<string, unknown> = {
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      category: form.category || null,
      skillTags: form.skillTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      difficulty: form.difficulty,
      format: form.format,
      status: form.status,
      estimatedDurationMin: form.estimatedDurationMin,
      thumbnailUrl: form.thumbnailUrl || null,
    };

    if (form.scoringConfig.trim()) {
      try {
        body.scoringConfig = JSON.parse(form.scoringConfig);
      } catch {
        setError("Invalid scoring config JSON");
        setSaving(false);
        return;
      }
    }

    const res = await fetch(`/api/admin/simulations/${simulation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to update");
      setSaving(false);
      return;
    }

    setSuccess("Saved");
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this simulation? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/simulations/${simulation.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/admin/simulations");
    else setError("Failed to delete");
  }

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Simulation</h1>
        <button
          onClick={handleDelete}
          className="text-sm text-red-400 hover:text-red-300 transition"
        >
          Delete
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
              onChange={(e) => updateField("slug", e.target.value)}
              required
            />
          </div>
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
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="staged">Staged</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Scoring Config (JSON)
          </label>
          <textarea
            className={`${inputClass} font-mono text-xs`}
            rows={8}
            value={form.scoringConfig}
            onChange={(e) => updateField("scoringConfig", e.target.value)}
            placeholder='{"dimensions": [...]}'
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
