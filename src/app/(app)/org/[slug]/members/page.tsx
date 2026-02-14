import type { Metadata } from "next";
import { requireOrgAdmin } from "@/lib/org";
import { db } from "@/lib/db";
import InviteForm from "./InviteForm";

export const metadata: Metadata = { title: "Members — Simvado" };

type Props = { params: Promise<{ slug: string }> };

export default async function MembersPage({ params }: Props) {
  const { slug } = await params;
  const { org } = await requireOrgAdmin(slug);

  const members = await db.orgMembership.findMany({
    where: { organizationId: org.id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Members ({members.length}/{org.seatLimit})
        </h2>
      </div>

      <InviteForm slug={slug} />

      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
          >
            <div>
              <p className="font-medium">{m.user.name ?? m.user.email}</p>
              <p className="text-sm text-text-muted">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {m.department && (
                <span className="text-xs text-text-muted">{m.department}</span>
              )}
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  m.role === "admin"
                    ? "bg-brand-500/10 text-brand-400"
                    : "bg-surface-overlay text-text-muted"
                }`}
              >
                {m.role}
              </span>
              <p className="text-xs text-text-muted">
                Joined {new Date(m.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
