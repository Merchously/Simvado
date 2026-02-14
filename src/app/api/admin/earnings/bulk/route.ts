import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { earningIds, status } = await req.json();
  if (
    !Array.isArray(earningIds) ||
    earningIds.length === 0 ||
    !["invoiced", "paid"].includes(status)
  ) {
    return NextResponse.json(
      { error: "earningIds[] and valid status required" },
      { status: 400 }
    );
  }

  const result = await db.studioEarning.updateMany({
    where: { id: { in: earningIds } },
    data: { status },
  });

  return NextResponse.json({ updated: result.count });
}
