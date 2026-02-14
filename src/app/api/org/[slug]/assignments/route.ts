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

  const assignments = await db.simulationAssignment.findMany({
    where: { organizationId: ctx.org.id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      simulation: { select: { id: true, title: true } },
    },
    orderBy: { assignedAt: "desc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { assignedToUserId, simulationId, dueDate } = await req.json();
  if (!assignedToUserId || !simulationId) {
    return NextResponse.json(
      { error: "assignedToUserId and simulationId are required" },
      { status: 400 }
    );
  }

  const assignment = await db.simulationAssignment.create({
    data: {
      organizationId: ctx.org.id,
      assignedByUserId: ctx.user.id,
      assignedToUserId,
      simulationId,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "assigned",
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}
