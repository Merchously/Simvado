import { NextResponse } from "next/server";
import { requireStudioMemberApi } from "@/lib/studio";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string; id: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug, id } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const simulation = await db.simulation.findUnique({ where: { id } });
  if (!simulation || simulation.studioId !== ctx.studio.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const modules = await db.module.findMany({
    where: { simulationId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(modules);
}

export async function POST(req: Request, { params }: Props) {
  const { slug, id } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const simulation = await db.simulation.findUnique({ where: { id } });
  if (!simulation || simulation.studioId !== ctx.studio.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    title,
    slug: moduleSlug,
    sortOrder,
    launchUrl,
    platform,
    buildVersion,
    isFreeDemo,
    estimatedDurationMin,
  } = body;

  if (!title || !moduleSlug) {
    return NextResponse.json(
      { error: "title and slug are required" },
      { status: 400 }
    );
  }

  const simModule = await db.module.create({
    data: {
      simulationId: id,
      title,
      slug: moduleSlug,
      sortOrder: sortOrder ?? 0,
      launchUrl: launchUrl || null,
      platform: platform ?? "unreal",
      buildVersion: buildVersion || null,
      isFreeDemo: isFreeDemo ?? false,
      estimatedDurationMin: estimatedDurationMin ?? null,
      status: "draft",
    },
  });

  return NextResponse.json(simModule, { status: 201 });
}
