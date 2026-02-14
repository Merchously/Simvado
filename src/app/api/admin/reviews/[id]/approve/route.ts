import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Props) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const simulation = await db.simulation.findUnique({ where: { id } });
  if (!simulation || simulation.status !== "review") {
    return NextResponse.json(
      { error: "Simulation not found or not in review" },
      { status: 404 }
    );
  }

  const updated = await db.simulation.update({
    where: { id },
    data: { status: "published", publishedAt: new Date() },
  });

  await db.module.updateMany({
    where: { simulationId: id },
    data: { status: "published" },
  });

  return NextResponse.json(updated);
}
