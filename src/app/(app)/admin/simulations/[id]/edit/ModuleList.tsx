"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Module {
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
}

export default function ModuleList({
  simulationId,
  modules,
}: {
  simulationId: string;
  modules: Module[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Modules</h2>
        <button
          onClick={() => setAdding(true)}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition"
        >
          Add Module
        </button>
      </div>

      {adding && (
        <ModuleForm
          simulationId={simulationId}
          sortOrder={modules.length + 1}
          onDone={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}

      {modules.length === 0 && !adding && (
        <p className="text-text-muted text-sm">No modules yet.</p>
      )}

      {modules.map((mod) => (
        <div
          key={mod.id}
          className="rounded-xl border border-border-subtle bg-surface-raised p-4"
        >
          {editingId === mod.id ? (
            <ModuleForm
              simulationId={simulationId}
              moduleData={mod}
              sortOrder={mod.sortOrder}
              onDone={() => {
                setEditingId(null);
                router.refresh();
              }}
            />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {mod.sortOrder}. {mod.title}
                </p>
                <p className="text-sm text-text-muted">
                  /{mod.slug} &middot; {mod.platform ?? "unset"} &middot;{" "}
                  {mod.status}
                  {mod.isFreeDemo && " (free demo)"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingId(mod.id)}
                  className="text-sm text-brand-400 hover:text-brand-300 transition"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this module?")) return;
                    await fetch(`/api/admin/modules/${mod.id}`, {
                      method: "DELETE",
                    });
                    router.refresh();
                  }}
                  className="text-sm text-red-400 hover:text-red-300 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ModuleForm({
  simulationId,
  moduleData,
  sortOrder,
  onDone,
}: {
  simulationId: string;
  moduleData?: Module;
  sortOrder: number;
  onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!moduleData;

  const [form, setForm] = useState({
    title: moduleData?.title ?? "",
    slug: moduleData?.slug ?? "",
    sortOrder: moduleData?.sortOrder ?? sortOrder,
    launchUrl: moduleData?.launchUrl ?? "",
    platform: moduleData?.platform ?? "unreal",
    buildVersion: moduleData?.buildVersion ?? "",
    isFreeDemo: moduleData?.isFreeDemo ?? false,
    estimatedDurationMin: moduleData?.estimatedDurationMin ?? 45,
    status: moduleData?.status ?? "draft",
  });

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEdit
      ? `/api/admin/modules/${moduleData!.id}`
      : `/api/admin/simulations/${simulationId}/modules`;

    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        launchUrl: form.launchUrl || null,
        buildVersion: form.buildVersion || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
      setSaving(false);
      return;
    }

    onDone();
  }

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <input
          className={inputClass}
          placeholder="Title"
          value={form.title}
          onChange={(e) => {
            const title = e.target.value;
            setForm((p) => ({
              ...p,
              title,
              slug: isEdit ? p.slug : slugify(title),
            }));
          }}
          required
        />
        <input
          className={inputClass}
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
          required
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        <select
          className={inputClass}
          value={form.platform}
          onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
        >
          <option value="unreal">Unreal</option>
          <option value="unity">Unity</option>
          <option value="web">Web</option>
          <option value="other">Other</option>
        </select>
        <select
          className={inputClass}
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <input
          type="number"
          className={inputClass}
          placeholder="Order"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 1 }))
          }
        />
        <input
          type="number"
          className={inputClass}
          placeholder="Duration (min)"
          value={form.estimatedDurationMin}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              estimatedDurationMin: parseInt(e.target.value) || 0,
            }))
          }
        />
      </div>
      <input
        className={inputClass}
        placeholder="Launch URL"
        value={form.launchUrl}
        onChange={(e) => setForm((p) => ({ ...p, launchUrl: e.target.value }))}
      />
      <div className="flex items-center gap-4">
        <input
          className={inputClass}
          placeholder="Build Version"
          value={form.buildVersion}
          onChange={(e) =>
            setForm((p) => ({ ...p, buildVersion: e.target.value }))
          }
        />
        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
          <input
            type="checkbox"
            checked={form.isFreeDemo}
            onChange={(e) =>
              setForm((p) => ({ ...p, isFreeDemo: e.target.checked }))
            }
          />
          Free demo
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium transition"
        >
          {saving ? "Saving..." : isEdit ? "Save" : "Add"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-1.5 rounded-lg border border-border-subtle text-sm transition hover:bg-surface-raised"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
