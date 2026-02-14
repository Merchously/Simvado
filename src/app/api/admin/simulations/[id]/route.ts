import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const simulation = await db.simulation.findUnique({ where: { id } });
  if (!simulation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  const fields = [
    "title",
    "slug",
    "description",
    "category",
    "skillTags",
    "difficulty",
    "format",
    "status",
    "estimatedDurationMin",
    "thumbnailUrl",
    "scoringConfig",
  ];

  for (const field of fields) {
    if (field in body) {
      data[field] = body[field];
    }
  }

  if (
    body.status === "published" &&
    simulation.status !== "published"
  ) {
    data.publishedAt = new Date();
  }

  const updated = await db.simulation.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await db.simulation.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
