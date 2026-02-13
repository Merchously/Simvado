import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");

  const simulations = await db.simulation.findMany({
    where: {
      status: "published",
      ...(category ? { category } : {}),
      ...(difficulty
        ? { difficulty: difficulty as "foundational" | "intermediate" | "advanced" | "executive" }
        : {}),
    },
    include: {
      modules: {
        where: { status: "published" },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          sortOrder: true,
          isFreeDemo: true,
          estimatedDurationMin: true,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json(simulations);
}
