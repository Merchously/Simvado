import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    slug,
    description,
    category,
    skillTags,
    difficulty,
    format,
    estimatedDurationMin,
    thumbnailUrl,
    scoringConfig,
  } = body;

  if (!title || !slug) {
    return NextResponse.json(
      { error: "title and slug are required" },
      { status: 400 }
    );
  }

  const existing = await db.simulation.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A simulation with this slug already exists" },
      { status: 409 }
    );
  }

  const simulation = await db.simulation.create({
    data: {
      title,
      slug,
      description: description || null,
      category: category || null,
      skillTags: skillTags ?? [],
      difficulty: difficulty ?? "intermediate",
      format: format ?? "unreal_3d",
      status: "draft",
      estimatedDurationMin: estimatedDurationMin ?? null,
      thumbnailUrl: thumbnailUrl || null,
      scoringConfig: scoringConfig ?? undefined,
      authorId: admin.id,
    },
  });

  return NextResponse.json(simulation, { status: 201 });
}
