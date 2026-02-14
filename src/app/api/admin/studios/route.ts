import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const studios = await db.studio.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { simulations: true, members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(studios);
}
