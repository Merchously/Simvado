import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiKey } from "@/lib/api-keys";
import { anthropic } from "@/lib/ai";

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Props) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const keyRecord = await verifyApiKey(authHeader.slice(7));
  if (!keyRecord) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { id } = await params;
  const { finalScores, totalDurationSeconds, summary } = await req.json();

  const session = await db.session.findUnique({
    where: { id },
    include: {
      module: { include: { simulation: true } },
      gameEvents: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status === "completed") {
    return NextResponse.json(
      { error: "Session already completed" },
      { status: 400 }
    );
  }

  // Store completion event
  await db.gameEvent.create({
    data: {
      sessionId: id,
      eventType: "completion",
      eventData: { finalScores, totalDurationSeconds, summary },
    },
  });

  // Generate AI debrief from game events + final scores
  let debriefText: string | null = null;
  try {
    const eventSummary = session.gameEvents
      .filter((e) => e.eventType === "decision")
      .map((e) => JSON.stringify(e.eventData))
      .join("\n");

    const debriefMsg = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are an executive coach providing a post-simulation debrief. Be direct, specific, and constructive.

Simulation: ${session.module.simulation.title}
Module: ${session.module.title}
Final scores: ${JSON.stringify(finalScores)}
Duration: ${totalDurationSeconds} seconds
Summary from game engine: ${summary ?? "N/A"}

Player decisions during the simulation:
${eventSummary || "No detailed decision data available."}

Provide a debrief in Markdown with these sections:
1. Summary of Performance
2. Strengths
3. Blind Spots
4. Alternative Approaches
5. Development Recommendations`,
        },
      ],
    });
    const block = debriefMsg.content[0];
    if (block.type === "text") debriefText = block.text;
  } catch {
    debriefText = "Debrief generation is temporarily unavailable.";
  }

  await db.session.update({
    where: { id },
    data: {
      status: "completed",
      completedAt: new Date(),
      totalDurationSeconds,
      finalScores,
      debriefText,
      debriefGeneratedAt: debriefText ? new Date() : null,
    },
  });

  // Auto-update matching assignment status to completed
  await db.simulationAssignment.updateMany({
    where: {
      assignedToUserId: session.userId,
      simulationId: session.module.simulationId,
      status: { in: ["assigned", "in_progress"] },
    },
    data: { status: "completed" },
  });

  return NextResponse.json({
    status: "completed",
    debriefGenerated: !!debriefText,
  });
}
