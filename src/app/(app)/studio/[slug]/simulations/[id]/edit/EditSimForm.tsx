"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SimData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  skillTags: string[];
  difficulty: string;
  format: string;
  estimatedDurationMin: number | null;
  thumbnailUrl: string | null;
  status: string;
};

type ModuleData = {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
  launchUrl: string | null;
  platform: string | null;
  buildVersion: string | null;
  isFreeDemo: boolean;
  estimatedDurationMin: number | null;
  status: string;
};

const inputClass =
  "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export default function EditSimForm({
  studioSlug,
  simulation,
  modules: initialModules,
}: {
  studioSlug: string;
  simulation: SimData;
  modules: ModuleData[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(simulation.title);
  const [slug, setSlug] = useState(simulation.slug);
  const [description, setDescription] = useState(simulation.description);
  const [category, setCategory] = useState(simulation.category);
  const [skillTags, setSkillTags] = useState(simulation.skillTags.join(", "));
  const [difficulty, setDifficulty] = useState(simulation.difficulty);
  const [format, setFormat] = useState(simulation.format);
  const [duration, setDuration] = useState(
    simulation.estimatedDurationMin?.toString() ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Module management
  const [modules, setModules] = useState(initialModules);
  const [newModTitle, setNewModTitle] = useState("");
  const [newModSlug, setNewModSlug] = useState("");
  const [newModLaunchUrl, setNewModLaunchUrl] = useState("");
  const [newModPlatform, setNewModPlatform] = useState("unreal");

  const base = `/api/studio/${studioSlug}/simulations/${simulation.id}`;

  const save = async () => {
    setSaving(true);
    setError("");
    const res = await fetch(base, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        description,
        category,
        skillTags: skillTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        difficulty,
        format,
        estimatedDurationMin: duration ? parseInt(duration) : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
    }
    setSaving(false);
    router.refresh();
  };

  const submitForReview = async () => {
    setSubmitting(true);
    setError("");
    const res = await fetch(`${base}/submit`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit");
    } else {
      router.push(`/studio/${studioSlug}/simulations`);
    }
    setSubmitting(false);
  };

  const addModule = async () => {
    if (!newModTitle || !newModSlug) return;
    const res = await fetch(`${base}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newModTitle,
        slug: newModSlug,
        launchUrl: newModLaunchUrl || null,
        platform: newModPlatform,
        sortOrder: modules.length + 1,
      }),
    });
    if (res.ok) {
      const mod = await res.json();
      setModules([...modules, mod]);
      setNewModTitle("");
      setNewModSlug("");
      setNewModLaunchUrl("");
    }
  };

  const deleteModule = async (moduleId: string) => {
    await fetch(`${base}/modules/${moduleId}`, { method: "DELETE" });
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Simulation</h1>
        <p className="mt-1 text-text-secondary">
          Update your simulation details and modules.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-4">
        <div>
          <label className="text-sm text-text-muted block mb-1">Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-text-muted block mb-1">Slug</label>
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-text-muted block mb-1">
            Description
          </label>
          <textarea
            className={inputClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-muted block mb-1">
              Category
            </label>
            <input
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-text-muted block mb-1">
              Skill Tags
            </label>
            <input
              className={inputClass}
              value={skillTags}
              onChange={(e) => setSkillTags(e.target.value)}
              placeholder="leadership, negotiation"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-text-muted block mb-1">
              Difficulty
            </label>
            <select
              className={inputClass}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="foundational">Foundational</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="executive">Executive</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-text-muted block mb-1">Format</label>
            <select
              className={inputClass}
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="unreal_3d">Unreal 3D</option>
              <option value="unity_3d">Unity 3D</option>
              <option value="branching_narrative">Branching Narrative</option>
              <option value="realtime_crisis">Realtime Crisis</option>
              <option value="ai_adaptive">AI Adaptive</option>
              <option value="external_custom">External Custom</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-text-muted block mb-1">
              Duration (min)
            </label>
            <input
              type="number"
              className={inputClass}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {simulation.status === "draft" && (
            <button
              onClick={submitForReview}
              disabled={submitting || modules.length === 0}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Modules</h2>
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
          >
            <div>
              <p className="font-medium">{mod.title}</p>
              <p className="text-xs text-text-muted">
                {mod.platform} &middot; {mod.slug}
                {mod.launchUrl && ` · ${mod.launchUrl}`}
              </p>
            </div>
            <button
              onClick={() => deleteModule(mod.id)}
              className="text-xs text-red-400 hover:text-red-300 transition"
            >
              Delete
            </button>
          </div>
        ))}

        <div className="rounded-xl border border-border-subtle bg-surface-raised p-4 space-y-3">
          <p className="text-sm font-medium">Add Module</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              placeholder="Module title"
              value={newModTitle}
              onChange={(e) => {
                setNewModTitle(e.target.value);
                setNewModSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")
                );
              }}
            />
            <input
              className={inputClass}
              placeholder="Slug"
              value={newModSlug}
              onChange={(e) => setNewModSlug(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Launch URL (optional)"
              value={newModLaunchUrl}
              onChange={(e) => setNewModLaunchUrl(e.target.value)}
            />
            <select
              className={inputClass}
              value={newModPlatform}
              onChange={(e) => setNewModPlatform(e.target.value)}
            >
              <option value="unreal">Unreal</option>
              <option value="unity">Unity</option>
              <option value="web">Web</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            onClick={addModule}
            disabled={!newModTitle || !newModSlug}
            className="px-4 py-2 rounded-lg border border-border-subtle text-sm hover:bg-surface-raised transition disabled:opacity-50"
          >
            Add Module
          </button>
        </div>
      </div>
    </div>
  );
}
