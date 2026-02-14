"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export default function InviteForm({ studioSlug }: { studioSlug: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const invite = async () => {
    if (!email) return;
    setSaving(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/studio/${studioSlug}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    if (res.ok) {
      setSuccess("Member invited!");
      setEmail("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to invite");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 space-y-4">
      <p className="text-sm font-medium">Invite Team Member</p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}
      <div className="flex items-center gap-3">
        <input
          className={inputClass}
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className={`${inputClass} w-40`}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={invite}
          disabled={!email || saving}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition whitespace-nowrap disabled:opacity-50"
        >
          {saving ? "Inviting..." : "Invite"}
        </button>
      </div>
    </div>
  );
}
