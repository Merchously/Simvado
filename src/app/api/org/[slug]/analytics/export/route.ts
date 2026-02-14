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

  const sessions = await db.session.findMany({
    where: { organizationId: ctx.org.id, status: "completed" },
    include: {
      user: { select: { name: true, email: true } },
      module: { include: { simulation: { select: { title: true } } } },
    },
    orderBy: { completedAt: "desc" },
  });

  const header = "Name,Email,Simulation,Module,Total Score,Completed";
  const rows = sessions.map((s) => {
    const scores = (s.finalScores as Record<string, number>) ?? {};
    return [
      `"${s.user.name ?? ""}"`,
      `"${s.user.email}"`,
      `"${s.module.simulation.title}"`,
      `"${s.module.title}"`,
      scores.total ?? 0,
      s.completedAt?.toISOString() ?? "",
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${slug}-analytics.csv"`,
    },
  });
}
