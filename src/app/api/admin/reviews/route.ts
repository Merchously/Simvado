import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const simulations = await db.simulation.findMany({
    where: { status: "review" },
    include: {
      studio: { select: { id: true, name: true, slug: true } },
      _count: { select: { modules: true } },
    },
    orderBy: { submittedAt: "asc" },
  });

  return NextResponse.json(simulations);
}
