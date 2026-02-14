"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"participant" | "admin">("participant");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch(`/api/org/${slug}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, department: department || undefined }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSuccess(`${email} added as ${role}`);
    setEmail("");
    setDepartment("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border-subtle bg-surface-raised p-4"
    >
      <h3 className="text-sm font-semibold mb-3">Add Member</h3>
      <div className="flex flex-wrap gap-3">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "participant" | "admin")}
          className="px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none"
        >
          <option value="participant">Participant</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          placeholder="Department (optional)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface text-sm border border-border-subtle focus:border-brand-600 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-400">{success}</p>}
    </form>
  );
}
