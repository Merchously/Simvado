"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const DIFFICULTIES = ["foundational", "intermediate", "advanced", "executive"];

const FORMATS = [
  "branching_narrative",
  "realtime_crisis",
  "ai_adaptive",
  "multiplayer_board",
  "unreal_3d",
  "unity_3d",
  "external_custom",
];

const inputClass =
  "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export default function CreateSimForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [simSlug, setSimSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skillTags, setSkillTags] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [format, setFormat] = useState("branching_narrative");
  const [estimatedDurationMin, setEstimatedDurationMin] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    setSimSlug(toSlug(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/studio/${slug}/simulations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: simSlug,
        description,
        category,
        skillTags: skillTags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        difficulty,
        format,
        estimatedDurationMin: estimatedDurationMin
          ? parseInt(estimatedDurationMin, 10)
          : undefined,
        thumbnailUrl: thumbnailUrl || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(`/studio/${slug}/simulations`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-border-subtle bg-surface-raised p-6"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className={inputClass}
            placeholder="Crisis Management 101"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Slug</label>
          <input
            type="text"
            value={simSlug}
            onChange={(e) => setSimSlug(e.target.value)}
            required
            className={inputClass}
            placeholder="crisis-management-101"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="A brief description of your simulation..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className={inputClass}
            placeholder="Leadership"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Skill Tags (comma-separated)
          </label>
          <input
            type="text"
            value={skillTags}
            onChange={(e) => setSkillTags(e.target.value)}
            className={inputClass}
            placeholder="communication, negotiation, leadership"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={inputClass}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className={inputClass}
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Est. Duration (min)
          </label>
          <input
            type="number"
            value={estimatedDurationMin}
            onChange={(e) => setEstimatedDurationMin(e.target.value)}
            min={1}
            className={inputClass}
            placeholder="30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Thumbnail URL
        </label>
        <input
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg border border-border-subtle text-sm hover:bg-surface-raised transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Simulation"}
        </button>
      </div>
    </form>
  );
}
