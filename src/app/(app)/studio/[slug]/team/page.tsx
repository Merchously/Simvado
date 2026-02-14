import { requireStudioAdmin } from "@/lib/studio";
import { db } from "@/lib/db";
import InviteForm from "./InviteForm";

type Props = { params: Promise<{ slug: string }> };

const roleColors: Record<string, string> = {
  owner: "bg-brand-500/10 text-brand-400",
  admin: "bg-blue-500/10 text-blue-400",
  member: "bg-gray-500/10 text-gray-400",
};

export default async function StudioTeamPage({ params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioAdmin(slug);

  const members = await db.studioMember.findMany({
    where: { studioId: ctx.studio.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="mt-1 text-text-secondary">
          Manage who can access your studio.
        </p>
      </div>

      <InviteForm studioSlug={slug} />

      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
          >
            <div>
              <p className="font-medium text-sm">
                {m.user.name || m.user.email}
              </p>
              <p className="text-xs text-text-muted">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[m.role] ?? ""}`}
              >
                {m.role}
              </span>
              <span className="text-xs text-text-muted">
                Joined {new Date(m.joinedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
