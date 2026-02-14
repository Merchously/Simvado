import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

export function generateApiKey(): {
  key: string;
  hash: string;
  prefix: string;
} {
  const key = `sk_sim_${randomBytes(32).toString("hex")}`;
  const hash = createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 15);
  return { key, hash, prefix };
}

export async function verifyApiKey(key: string) {
  const hash = createHash("sha256").update(key).digest("hex");
  const record = await db.apiKey.findUnique({ where: { keyHash: hash } });
  if (!record || !record.isActive) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;

  await db.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return record;
}
