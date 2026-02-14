import { NextResponse } from "next/server";
import { requireStudioMemberApi } from "@/lib/studio";
import { db } from "@/lib/db";

type Props = {
  params: Promise<{ slug: string; id: string; moduleId: string }>;
};

export async function PATCH(req: Request, { params }: Props) {
  const { slug, id, moduleId } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const simModule = await db.module.findUnique({
    where: { id: moduleId },
    include: { simulation: { select: { studioId: true } } },
  });
  if (
    !simModule ||
    simModule.simulationId !== id ||
    simModule.simulation.studioId !== ctx.studio.id
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  const fields = [
    "title",
    "slug",
    "sortOrder",
    "narrativeContext",
    "stakeholders",
    "launchUrl",
    "platform",
    "buildVersion",
    "isFreeDemo",
    "estimatedDurationMin",
    "status",
  ];

  for (const field of fields) {
    if (field in body) {
      data[field] = body[field];
    }
  }

  const updated = await db.module.update({ where: { id: moduleId }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Props) {
  const { slug, id, moduleId } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const simModule = await db.module.findUnique({
    where: { id: moduleId },
    include: { simulation: { select: { studioId: true } } },
  });
  if (
    !simModule ||
    simModule.simulationId !== id ||
    simModule.simulation.studioId !== ctx.studio.id
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.module.delete({ where: { id: moduleId } });
  return NextResponse.json({ deleted: true });
}
