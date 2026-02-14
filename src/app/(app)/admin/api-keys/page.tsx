import type { Metadata } from "next";
import { db } from "@/lib/db";
import GenerateKeyForm from "./GenerateKeyForm";

export const metadata: Metadata = { title: "API Keys — Admin — Simvado" };

export default async function AdminApiKeysPage() {
  const [keys, simulations] = await Promise.all([
    db.apiKey.findMany({
      include: { simulation: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.simulation.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">API Keys</h1>

      <GenerateKeyForm
        simulations={simulations.map((s) => ({ id: s.id, title: s.title }))}
      />

      {keys.length === 0 ? (
        <p className="text-text-muted">No API keys yet.</p>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised p-4"
            >
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="text-sm text-text-muted font-mono">
                  {key.keyPrefix}...
                  {key.simulation && (
                    <span className="ml-2 font-sans">
                      &middot; {key.simulation.title}
                    </span>
                  )}
                  {key.lastUsedAt && (
                    <span className="ml-2 font-sans">
                      &middot; Last used{" "}
                      {new Date(key.lastUsedAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    key.isActive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {key.isActive ? "Active" : "Revoked"}
                </span>
                {key.isActive && (
                  <RevokeButton keyId={key.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RevokeButton({ keyId }: { keyId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { requireAdminApi } = await import("@/lib/admin");
        const admin = await requireAdminApi();
        if (!admin) return;
        const { db: database } = await import("@/lib/db");
        await database.apiKey.update({
          where: { id: keyId },
          data: { isActive: false },
        });
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/api-keys");
      }}
    >
      <button
        type="submit"
        className="text-sm text-red-400 hover:text-red-300 transition"
      >
        Revoke
      </button>
    </form>
  );
}
