import { NextResponse } from "next/server";
import { requireStudioMemberApi } from "@/lib/studio";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const simulationId = searchParams.get("simulationId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { studioId: ctx.studio.id };
  if (simulationId) where.simulationId = simulationId;
  if (status) where.status = status;

  const earnings = await db.studioEarning.findMany({
    where,
    include: { simulation: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(earnings);
}
