import { NextResponse } from "next/server";
import { requireStudioMemberApi, requireStudioAdminApi } from "@/lib/studio";
import { db } from "@/lib/db";
import { generateApiKey } from "@/lib/api-keys";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const keys = await db.apiKey.findMany({
    where: { studioId: ctx.studio.id },
    include: { simulation: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keys);
}

export async function POST(req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, simulationId, expiresAt } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // If simulationId is provided, verify it belongs to this studio
  if (simulationId) {
    const simulation = await db.simulation.findUnique({
      where: { id: simulationId },
    });
    if (!simulation || simulation.studioId !== ctx.studio.id) {
      return NextResponse.json(
        { error: "Simulation not found in this studio" },
        { status: 404 }
      );
    }
  }

  const { key, hash, prefix } = generateApiKey();

  const record = await db.apiKey.create({
    data: {
      name,
      keyHash: hash,
      keyPrefix: prefix,
      simulationId: simulationId || null,
      studioId: ctx.studio.id,
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
