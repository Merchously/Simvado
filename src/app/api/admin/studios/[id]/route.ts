import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const studio = await db.studio.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { simulations: true, members: true } },
    },
  });

  if (!studio) {
    return NextResponse.json({ error: "Studio not found" }, { status: 404 });
  }

  return NextResponse.json(studio);
}

export async function PATCH(req: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, rejectionReason } = body;

  const studio = await db.studio.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!studio) {
    return NextResponse.json({ error: "Studio not found" }, { status: 404 });
  }

  if (status === "approved") {
    // Approve studio and promote owner to studio_creator
    const updated = await db.$transaction(async (tx) => {
      const updatedStudio = await tx.studio.update({
        where: { id },
        data: { status: "approved", rejectionReason: null },
      });

      await tx.user.update({
        where: { id: studio.ownerId },
        data: { role: "studio_creator" },
      });

      return updatedStudio;
    });

    return NextResponse.json(updated);
  }

  if (status === "rejected") {
    const updated = await db.studio.update({
      where: { id },
      data: {
        status: "rejected",
        rejectionReason: rejectionReason || null,
      },
    });

    return NextResponse.json(updated);
  }

  if (status === "suspended") {
    const updated = await db.studio.update({
      where: { id },
      data: { status: "suspended" },
    });

    return NextResponse.json(updated);
  }

  return NextResponse.json(
    { error: "Invalid status. Must be approved, rejected, or suspended." },
    { status: 400 }
  );
}
