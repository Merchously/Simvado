"use client";

import { useState } from "react";

interface CheckoutButtonProps {
  label: string;
  plan: "monthly" | "annual";
  className?: string;
}

export default function CheckoutButton({
  label,
  plan,
  className = "",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition disabled:opacity-50 ${className}`}
    >
      {loading ? "Redirecting..." : label}
    </button>
  );
}
