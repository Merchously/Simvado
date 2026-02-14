"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/studios/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setSaving(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  if (success) {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 space-y-2">
        <h2 className="text-lg font-semibold text-green-400">
          Application submitted!
        </h2>
        <p className="text-sm text-text-secondary">
          We&apos;ll review it soon. You&apos;ll be notified once your studio
          is approved.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-5"
    >
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="studio-name" className="block text-sm font-medium">
          Studio Name <span className="text-red-400">*</span>
        </label>
        <input
          id="studio-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Apex Learning Studios"
          className={inputClass}
        />
        {slug && (
          <p className="text-xs text-text-muted">
            Your studio URL will be:{" "}
            <span className="font-mono text-text-secondary">
              simvado.com/studio/{slug}
            </span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="studio-description"
          className="block text-sm font-medium"
        >
          Description
        </label>
        <textarea
          id="studio-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about your studio, your expertise, and the types of simulations you plan to create..."
          className={inputClass + " resize-none"}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="studio-website" className="block text-sm font-medium">
          Website URL{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          id="studio-website"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourstudio.com"
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {saving ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
