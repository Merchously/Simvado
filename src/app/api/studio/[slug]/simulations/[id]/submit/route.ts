import { NextResponse } from "next/server";
import { requireStudioMemberApi } from "@/lib/studio";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string; id: string }> };

export async function POST(_req: Request, { params }: Props) {
  const { slug, id } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const simulation = await db.simulation.findUnique({
    where: { id },
    include: { _count: { select: { modules: true } } },
  });
  if (!simulation || simulation.studioId !== ctx.studio.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (simulation.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft simulations can be submitted for review" },
      { status: 400 }
    );
  }

  if (simulation._count.modules === 0) {
    return NextResponse.json(
      { error: "Simulation must have at least one module before submitting" },
      { status: 400 }
    );
  }

  const updated = await db.simulation.update({
    where: { id },
    data: {
      status: "review",
      submittedAt: new Date(),
      reviewNotes: null,
    },
  });

  return NextResponse.json(updated);
}
