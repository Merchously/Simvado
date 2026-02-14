"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateOrgForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState("pilot");
  const [seatLimit, setSeatLimit] = useState("25");
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        plan,
        seatLimit: parseInt(seatLimit, 10),
        adminEmail,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.refresh();
    setName("");
    setSlug("");
    setAdminEmail("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border-subtle bg-surface-raised p-4"
    >
      <h3 className="text-sm font-semibold mb-3">Create Organization</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Organization name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none"
        />
        <input
          type="text"
          placeholder="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none font-mono"
        />
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none"
        >
          <option value="pilot">Pilot</option>
          <option value="standard">Standard</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <input
          type="number"
          placeholder="Seat limit"
          value={seatLimit}
          onChange={(e) => setSeatLimit(e.target.value)}
          min={1}
          className="px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none"
        />
        <input
          type="email"
          placeholder="Admin email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          required
          className="px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none sm:col-span-2"
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Organization"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </form>
  );
}
