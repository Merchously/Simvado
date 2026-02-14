import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: simulationId } = await params;

  const simulation = await db.simulation.findUnique({
    where: { id: simulationId },
  });
  if (!simulation) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, slug, sortOrder, launchUrl, platform, buildVersion, isFreeDemo, estimatedDurationMin, status } = body;

  if (!title || !slug) {
    return NextResponse.json(
      { error: "title and slug are required" },
      { status: 400 }
    );
  }

  const simModule = await db.module.create({
    data: {
      simulationId,
      title,
      slug,
      sortOrder: sortOrder ?? 1,
      launchUrl: launchUrl || null,
      platform: platform ?? "unreal",
      buildVersion: buildVersion || null,
      isFreeDemo: isFreeDemo ?? false,
      estimatedDurationMin: estimatedDurationMin ?? null,
      status: status ?? "draft",
    },
  });

  return NextResponse.json(simModule, { status: 201 });
}
