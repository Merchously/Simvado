import { NextResponse } from "next/server";
import { requireOrgAdminApi } from "@/lib/org";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userIds, simulationId, dueDate } = await req.json();
  if (!Array.isArray(userIds) || userIds.length === 0 || !simulationId) {
    return NextResponse.json(
      { error: "userIds[] and simulationId are required" },
      { status: 400 }
    );
  }

  const assignments = await db.$transaction(
    userIds.map((userId: string) =>
      db.simulationAssignment.create({
        data: {
          organizationId: ctx.org.id,
          assignedByUserId: ctx.user.id,
          assignedToUserId: userId,
          simulationId,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: "assigned",
        },
      })
    )
  );

  return NextResponse.json({ created: assignments.length }, { status: 201 });
}
