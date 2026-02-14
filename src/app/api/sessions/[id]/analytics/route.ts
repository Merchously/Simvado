import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const session = await db.session.findUnique({
    where: { id, userId: user.id },
    include: {
      module: { include: { simulation: true } },
      gameEvents: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const decisions = session.gameEvents.filter((e) => e.eventType === "decision");
  const milestones = session.gameEvents.filter(
    (e) => e.eventType === "milestone"
  );
  const scoreUpdates = session.gameEvents.filter(
    (e) => e.eventType === "score_update"
  );

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      totalDurationSeconds: session.totalDurationSeconds,
      platform: session.platform,
    },
    simulation: {
      title: session.module.simulation.title,
      module: session.module.title,
    },
    finalScores: session.finalScores,
    timeline: {
      decisions,
      milestones,
      scoreUpdates,
      totalEvents: session.gameEvents.length,
    },
  });
}
