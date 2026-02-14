import { NextResponse } from "next/server";
import { requireStudioMemberApi } from "@/lib/studio";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string; id: string }> };

export async function PATCH(req: Request, { params }: Props) {
  const { slug, id } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const simulation = await db.simulation.findUnique({ where: { id } });
  if (!simulation || simulation.studioId !== ctx.studio.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  const fields = [
    "title",
    "slug",
    "description",
    "category",
    "skillTags",
    "difficulty",
    "format",
    "estimatedDurationMin",
    "thumbnailUrl",
    "scoringConfig",
  ];

  for (const field of fields) {
    if (field in body) {
      data[field] = body[field];
    }
  }

  const updated = await db.simulation.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Props) {
  const { slug, id } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const simulation = await db.simulation.findUnique({ where: { id } });
  if (!simulation || simulation.studioId !== ctx.studio.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (simulation.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft simulations can be deleted" },
      { status: 400 }
    );
  }

  await db.simulation.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
