import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import CreateOrgForm from "./CreateOrgForm";

export const metadata: Metadata = { title: "Organizations — Admin — Simvado" };

export default async function AdminOrganizationsPage() {
  const orgs = await db.organization.findMany({
    include: {
      _count: { select: { memberships: true, sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organizations</h1>

      <CreateOrgForm />

      {orgs.length === 0 ? (
        <p className="text-text-muted">No organizations yet.</p>
      ) : (
        <div className="space-y-2">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/org/${org.slug}`}
              className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4 hover:border-brand-600/50 transition block"
            >
              <div>
                <p className="font-medium">{org.name}</p>
                <p className="text-sm text-text-muted">/{org.slug}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-muted">
                  {org._count.memberships} members
                </span>
                <span className="text-xs text-text-muted">
                  {org._count.sessions} sessions
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-surface-overlay text-text-muted font-medium capitalize">
                  {org.plan}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
