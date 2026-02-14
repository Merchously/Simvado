import { NextResponse } from "next/server";
import { requireOrgAdminApi } from "@/lib/org";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const org = await db.organization.findUnique({
    where: { slug },
    include: {
      _count: { select: { memberships: true, sessions: true, assignments: true } },
    },
  });

  return NextResponse.json(org);
}

export async function PATCH(req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, seatLimit } = body;

  const updated = await db.organization.update({
    where: { id: ctx.org.id },
    data: {
      ...(name && { name }),
      ...(typeof seatLimit === "number" && { seatLimit }),
    },
  });

  return NextResponse.json(updated);
}
