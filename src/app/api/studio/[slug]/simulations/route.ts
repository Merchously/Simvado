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

  const simulations = await db.simulation.findMany({
    where: { studioId: ctx.studio.id },
    include: {
      modules: { select: { id: true } },
      _count: { select: { modules: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(simulations);
}

export async function POST(req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    slug: simSlug,
    description,
    category,
    skillTags,
    difficulty,
    format,
    estimatedDurationMin,
    thumbnailUrl,
    scoringConfig,
  } = body;

  if (!title || !simSlug) {
    return NextResponse.json(
      { error: "title and slug are required" },
      { status: 400 }
    );
  }

  const existing = await db.simulation.findUnique({
    where: { slug: simSlug },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A simulation with this slug already exists" },
      { status: 409 }
    );
  }

  const simulation = await db.simulation.create({
    data: {
      title,
      slug: simSlug,
      description: description || "",
      category: category || "",
      skillTags: skillTags ?? [],
      difficulty: difficulty ?? "intermediate",
      format: format ?? "branching_narrative",
      status: "draft",
      estimatedDurationMin: estimatedDurationMin ?? null,
      thumbnailUrl: thumbnailUrl || null,
      scoringConfig: scoringConfig ?? undefined,
      studioId: ctx.studio.id,
      authorId: ctx.user.id,
    },
  });

  return NextResponse.json(simulation, { status: 201 });
}
