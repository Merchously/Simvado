import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ApplyForm from "./ApplyForm";

export const metadata: Metadata = { title: "Apply as a Studio — Simvado" };

export default async function StudioApplyPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
  if (!dbUser) redirect("/dashboard");

  // Check if user already has a studio (most recent first)
  const existingStudio = await db.studio.findFirst({
    where: { ownerId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  if (existingStudio?.status === "approved") {
    redirect(`/studio/${existingStudio.slug}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Apply as a Studio</h1>
        <p className="mt-2 text-text-secondary">
          Submit your studio for review. Once approved, you can publish
          simulations on Simvado and earn revenue.
        </p>
      </div>

      {existingStudio?.status === "pending" && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 space-y-2">
          <h2 className="text-lg font-semibold text-yellow-400">
            Application Under Review
          </h2>
          <p className="text-sm text-text-secondary">
            Your studio <span className="font-medium text-text-primary">{existingStudio.name}</span>{" "}
            was submitted on{" "}
            {new Date(existingStudio.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            . We&apos;ll notify you once it&apos;s been reviewed.
          </p>
        </div>
      )}

      {existingStudio?.status === "rejected" && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-red-400">
            Application Rejected
          </h2>
          <p className="text-sm text-text-secondary">
            Your studio <span className="font-medium text-text-primary">{existingStudio.name}</span>{" "}
            was not approved.
          </p>
          {existingStudio.rejectionReason && (
            <div className="rounded-lg bg-surface-raised p-3 border border-border-subtle">
              <p className="text-xs font-medium text-text-muted mb-1">Reason</p>
              <p className="text-sm text-text-secondary">
                {existingStudio.rejectionReason}
              </p>
            </div>
          )}
          <p className="text-sm text-text-muted">
            You may reapply below with updated information.
          </p>
        </div>
      )}

      {existingStudio?.status !== "pending" && <ApplyForm />}
    </div>
  );
}
