import { requireStudioAdmin } from "@/lib/studio";
import { db } from "@/lib/db";
import GenerateKeyForm from "./GenerateKeyForm";

type Props = { params: Promise<{ slug: string }> };

export default async function StudioApiKeysPage({ params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioAdmin(slug);

  const [keys, simulations] = await Promise.all([
    db.apiKey.findMany({
      where: { studioId: ctx.studio.id },
      include: { simulation: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.simulation.findMany({
      where: { studioId: ctx.studio.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="mt-1 text-text-secondary">
          Manage API keys for your game engine integrations.
        </p>
      </div>

      <GenerateKeyForm
        studioSlug={slug}
        simulations={simulations}
      />

      <div className="space-y-2">
        {keys.length === 0 ? (
          <p className="text-text-muted">No API keys yet.</p>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
            >
              <div>
                <p className="font-medium text-sm">{key.name}</p>
                <p className="text-xs text-text-muted">
                  {key.keyPrefix}... &middot;{" "}
                  {key.simulation?.title ?? "All simulations"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">
                  {key.lastUsedAt
                    ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                    : "Never used"}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    key.isActive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {key.isActive ? "Active" : "Revoked"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
