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

  const apiKey = await db.apiKey.findUnique({ where: { id } });
  if (!apiKey || apiKey.studioId !== ctx.studio.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("isActive" in body) data.isActive = body.isActive;
  if ("name" in body) data.name = body.name;

  const updated = await db.apiKey.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Props) {
  const { slug, id } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const apiKey = await db.apiKey.findUnique({ where: { id } });
  if (!apiKey || apiKey.studioId !== ctx.studio.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.apiKey.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
