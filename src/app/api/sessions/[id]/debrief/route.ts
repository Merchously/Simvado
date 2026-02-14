import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { anthropic } from "@/lib/ai";

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

  // Return existing debrief if available
  if (session.debriefText) {
    return NextResponse.json({
      debrief: session.debriefText,
      generatedAt: session.debriefGeneratedAt,
    });
  }

  if (session.status !== "completed") {
    return NextResponse.json(
      { error: "Session not yet completed" },
      { status: 400 }
    );
  }

  // Generate debrief on demand
  const eventSummary = session.gameEvents
    .map((e) => `[${e.eventType}] ${JSON.stringify(e.eventData)}`)
    .join("\n");

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are an executive coach. Provide a post-simulation debrief. Be direct, specific, and constructive.

Simulation: ${session.module.simulation.title}
Module: ${session.module.title}
Final scores: ${JSON.stringify(session.finalScores)}
Duration: ${session.totalDurationSeconds}s

Events:
${eventSummary}

Provide Markdown with: Summary, Strengths, Blind Spots, Alternative Approaches, Development Recommendations.`,
        },
      ],
    });

    const block = msg.content[0];
    const debriefText = block.type === "text" ? block.text : null;

    if (debriefText) {
      await db.session.update({
        where: { id },
        data: { debriefText, debriefGeneratedAt: new Date() },
      });
    }

    return NextResponse.json({
      debrief: debriefText,
      generatedAt: new Date(),
    });
  } catch {
    return NextResponse.json(
      { error: "Debrief generation failed" },
      { status: 500 }
    );
  }
}
