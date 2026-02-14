import { NextResponse } from "next/server";
import { requireOrgAdminApi } from "@/lib/org";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string; id: string }> };

export async function PATCH(req: Request, { params }: Props) {
  const { slug, id } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { dueDate, status } = await req.json();

  const updated = await db.simulationAssignment.update({
    where: { id, organizationId: ctx.org.id },
    data: {
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
      ...(status && { status }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Props) {
  const { slug, id } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await db.simulationAssignment.delete({
    where: { id, organizationId: ctx.org.id },
  });

  return NextResponse.json({ deleted: true });
}
