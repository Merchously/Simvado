import { NextResponse } from "next/server";
import { requireStudioAdminApi } from "@/lib/studio";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string; userId: string }> };

export async function PATCH(req: Request, { params }: Props) {
  const { slug, userId } = await params;
  const ctx = await requireStudioAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const membership = await db.studioMember.findFirst({
    where: { userId, studioId: ctx.studio.id },
  });
  if (!membership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Cannot change the owner's role
  if (membership.role === "owner") {
    return NextResponse.json(
      { error: "Cannot change the owner's role" },
      { status: 400 }
    );
  }

  const { role } = await req.json();

  if (role !== "admin" && role !== "member") {
    return NextResponse.json(
      { error: "role must be 'admin' or 'member'" },
      { status: 400 }
    );
  }

  const updated = await db.studioMember.update({
    where: { id: membership.id },
    data: { role },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Props) {
  const { slug, userId } = await params;
  const ctx = await requireStudioAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const membership = await db.studioMember.findFirst({
    where: { userId, studioId: ctx.studio.id },
  });
  if (!membership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Cannot remove the owner
  if (membership.role === "owner") {
    return NextResponse.json(
      { error: "Cannot remove the studio owner" },
      { status: 400 }
    );
  }

  await db.studioMember.delete({ where: { id: membership.id } });
  return NextResponse.json({ deleted: true });
}
