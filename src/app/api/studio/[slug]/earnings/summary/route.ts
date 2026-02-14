import { NextResponse } from "next/server";
import { requireStudioMemberApi } from "@/lib/studio";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [totals, byStatus] = await Promise.all([
    db.studioEarning.aggregate({
      where: { studioId: ctx.studio.id },
      _sum: {
        grossAmount: true,
        studioAmount: true,
        platformAmount: true,
      },
    }),
    db.studioEarning.groupBy({
      by: ["status"],
      where: { studioId: ctx.studio.id },
      _sum: {
        grossAmount: true,
        studioAmount: true,
        platformAmount: true,
      },
    }),
  ]);

  const breakdown: Record<
    string,
    { gross: unknown; studio: unknown; platform: unknown }
  > = {};
  for (const row of byStatus) {
    breakdown[row.status] = {
      gross: row._sum.grossAmount,
      studio: row._sum.studioAmount,
      platform: row._sum.platformAmount,
    };
  }

  return NextResponse.json({
    totalGross: totals._sum.grossAmount,
    totalStudioAmount: totals._sum.studioAmount,
    totalPlatformAmount: totals._sum.platformAmount,
    breakdown,
  });
}
