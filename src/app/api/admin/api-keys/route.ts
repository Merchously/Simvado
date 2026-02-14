import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";
import { generateApiKey } from "@/lib/api-keys";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const keys = await db.apiKey.findMany({
    include: { simulation: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keys);
}

export async function POST(req: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, simulationId, expiresAt } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { key, hash, prefix } = generateApiKey();

  const record = await db.apiKey.create({
    data: {
      name,
      keyHash: hash,
      keyPrefix: prefix,
      simulationId: simulationId || null,
      scopes: ["game:write"],
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(
    { id: record.id, name: record.name, key, prefix },
    { status: 201 }
  );
}
