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

  const existing = await db.module.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  const fields = [
    "title",
    "slug",
    "sortOrder",
    "narrativeContext",
    "stakeholders",
    "launchUrl",
    "platform",
    "buildVersion",
    "isFreeDemo",
    "estimatedDurationMin",
    "status",
  ];

  for (const field of fields) {
    if (field in body) {
      data[field] = body[field];
    }
  }

  const updated = await db.module.update({ where: { id }, data });
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
  await db.module.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
