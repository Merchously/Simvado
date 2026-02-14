import { NextResponse } from "next/server";
import { requireOrgAdminApi } from "@/lib/org";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string; userId: string }> };

export async function PATCH(req: Request, { params }: Props) {
  const { slug, userId } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { role, department } = await req.json();

  const membership = await db.orgMembership.findFirst({
    where: { userId, organizationId: ctx.org.id },
  });
  if (!membership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Prevent removing the last admin
  if (role === "participant" && membership.role === "admin") {
    const adminCount = await db.orgMembership.count({
      where: { organizationId: ctx.org.id, role: "admin" },
    });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last admin" },
        { status: 400 }
      );
    }
  }

  const updated = await db.orgMembership.update({
    where: { id: membership.id },
    data: {
      ...(role && { role }),
      ...(department !== undefined && { department: department || null }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Props) {
  const { slug, userId } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const membership = await db.orgMembership.findFirst({
    where: { userId, organizationId: ctx.org.id },
  });
  if (!membership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Prevent removing the last admin
  if (membership.role === "admin") {
    const adminCount = await db.orgMembership.count({
      where: { organizationId: ctx.org.id, role: "admin" },
    });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last admin" },
        { status: 400 }
      );
    }
  }

  await db.orgMembership.delete({ where: { id: membership.id } });

  // Clear user's organizationId
  await db.user.update({
    where: { id: userId },
    data: { organizationId: null },
  });

  return NextResponse.json({ deleted: true });
}
