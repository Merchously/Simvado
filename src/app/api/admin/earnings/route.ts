import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const studioId = searchParams.get("studioId");
  const status = searchParams.get("status");

  const earnings = await db.studioEarning.findMany({
    where: {
      ...(studioId && { studioId }),
      ...(status && { status: status as "pending" | "invoiced" | "paid" }),
    },
    include: {
      studio: { select: { id: true, name: true } },
      simulation: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(earnings);
}
