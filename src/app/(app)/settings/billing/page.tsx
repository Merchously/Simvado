import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import CheckoutButton from "./CheckoutButton";

export const metadata: Metadata = { title: "Billing — Simvado" };

export default async function BillingPage() {
  const user = await currentUser();
  const dbUser = user
    ? await db.user.findUnique({ where: { clerkId: user.id } })
    : null;

  const tier = dbUser?.subscriptionTier ?? "free";
  const isPro = tier === "pro_monthly" || tier === "pro_annual";

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="mt-1 text-text-secondary">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
        <h2 className="text-lg font-semibold">Current Plan</h2>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-bold capitalize">
            {tier.replace("_", " ")}
          </span>
          {isPro && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-medium">
              Active
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-text-muted">
          {isPro
            ? tier === "pro_annual"
              ? "$699/year — Full library access, unlimited replays."
              : "$79/month — Full library access, unlimited replays."
            : "Free tier — Access one simulation from the library."}
        </p>

        {isPro && (
          <ManageButton />
        )}
      </div>

      {/* Upgrade options for free users */}
      {!isPro && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upgrade to Pro</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
              <h3 className="font-semibold">Monthly</h3>
              <p className="mt-2 text-3xl font-bold">
                $79<span className="text-sm font-normal text-text-muted">/mo</span>
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Full library access. Cancel anytime.
              </p>
              <CheckoutButton
                label="Subscribe Monthly"
                plan="monthly"
                className="mt-4"
              />
            </div>
            <div className="rounded-xl border border-brand-600 bg-surface-raised p-6 relative">
              <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-brand-600 text-xs font-medium text-white">
                Save 26%
              </div>
              <h3 className="font-semibold">Annual</h3>
              <p className="mt-2 text-3xl font-bold">
                $699<span className="text-sm font-normal text-text-muted">/yr</span>
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Best value. Full library access.
              </p>
              <CheckoutButton
                label="Subscribe Annually"
                plan="annual"
                className="mt-4"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ManageButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { auth: getAuth } = await import("@clerk/nextjs/server");
        const { userId: clerkId } = await getAuth();
        if (!clerkId) return;
        const { db: database } = await import("@/lib/db");
        const u = await database.user.findUnique({ where: { clerkId } });
        if (!u?.stripeCustomerId) return;
        const { getStripe: stripe } = await import("@/lib/stripe");
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const session = await stripe().billingPortal.sessions.create({
          customer: u.stripeCustomerId,
          return_url: `${appUrl}/settings/billing`,
        });
        const { redirect } = await import("next/navigation");
        redirect(session.url);
      }}
    >
      <button
        type="submit"
        className="mt-4 px-6 py-2.5 rounded-xl border border-border-default text-sm font-medium text-text-secondary hover:text-text-primary hover:border-brand-600/50 transition"
      >
        Manage Subscription
      </button>
    </form>
  );
}
