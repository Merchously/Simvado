import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { anthropic } from "@/lib/ai";

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Props) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { optionId, timeSpentSeconds } = await req.json();

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const session = await db.session.findUnique({
    where: { id, userId: user.id },
  });
  if (!session || session.status !== "in_progress") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const option = await db.nodeOption.findUnique({
    where: { id: optionId },
    include: { decisionNode: true },
  });
  if (!option) {
    return NextResponse.json({ error: "Option not found" }, { status: 404 });
  }

  // Calculate running scores
  const previousDecisions = await db.sessionDecision.findMany({
    where: { sessionId: session.id },
    include: { selectedOption: true },
  });

  const scoreImpacts = option.scoreImpacts as Record<string, number>;
  const runningScores: Record<string, number> = {
    financial: 50,
    reputational: 50,
    ethical: 50,
    stakeholder_confidence: 50,
    long_term_stability: 50,
  };

  // Apply all previous decisions
  for (const prev of previousDecisions) {
    const impacts = prev.selectedOption.scoreImpacts as Record<string, number>;
    for (const key of Object.keys(runningScores)) {
      runningScores[key] = Math.max(
        0,
        Math.min(100, runningScores[key] + (impacts[key] ?? 0))
      );
    }
  }

  // Apply current decision
  for (const key of Object.keys(runningScores)) {
    runningScores[key] = Math.max(
      0,
      Math.min(100, runningScores[key] + (scoreImpacts[key] ?? 0))
    );
  }

  // Generate AI dialogue
  let aiDialogue: string | null = null;
  if (option.decisionNode.aiPromptTemplate) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `${option.decisionNode.aiPromptTemplate}\n\nThe player chose: "${option.label}" — ${option.description}\n\nRespond in character as the NPC. Keep it to 2-3 sentences.`,
          },
        ],
      });
      const block = message.content[0];
      if (block.type === "text") {
        aiDialogue = block.text;
      }
    } catch {
      // AI failure is non-fatal
    }
  }

  // Record decision
  await db.sessionDecision.create({
    data: {
      sessionId: session.id,
      decisionNodeId: option.decisionNodeId,
      selectedOptionId: option.id,
      timeSpentSeconds: timeSpentSeconds ?? null,
      aiDialogueResponse: aiDialogue,
      scoreSnapshot: runningScores,
    },
  });

  const isComplete = option.nextNodeKey === null;

  // If complete, finalize session
  if (isComplete) {
    // Calculate total weighted score
    const totalDecisions = previousDecisions.length + 1;
    const total = Math.round(
      runningScores.financial * 0.2 +
        runningScores.reputational * 0.2 +
        runningScores.ethical * 0.25 +
        runningScores.stakeholder_confidence * 0.2 +
        runningScores.long_term_stability * 0.15
    );

    const grade =
      total >= 90 ? "A+" : total >= 85 ? "A" : total >= 80 ? "A-" :
      total >= 75 ? "B+" : total >= 70 ? "B" : total >= 65 ? "B-" :
      total >= 60 ? "C+" : total >= 55 ? "C" : total >= 50 ? "C-" : "D";

    // Generate debrief
    let debriefText: string | null = null;
    try {
      const debriefMsg = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `You are an executive coach providing a post-simulation debrief. Be direct, specific, and constructive.

Final scores: ${JSON.stringify(runningScores)}
Total score: ${total} (${grade})
Decisions made: ${totalDecisions}

Provide a debrief in Markdown with these sections:
1. Summary of Decisions
2. Strengths
3. Blind Spots
4. Alternative Paths
5. Development Recommendations`,
          },
        ],
      });
      const block = debriefMsg.content[0];
      if (block.type === "text") {
        debriefText = block.text;
      }
    } catch {
      debriefText = "Debrief generation is temporarily unavailable.";
    }

    await db.session.update({
      where: { id: session.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        totalDurationSeconds: timeSpentSeconds,
        finalScores: { ...runningScores, total, grade },
        debriefText,
        debriefGeneratedAt: debriefText ? new Date() : null,
      },
    });
  }

  return NextResponse.json({
    consequenceVideoUrl: option.consequenceVideoUrl,
    aiDialogue,
    runningScores,
    nextNodeKey: option.nextNodeKey,
    isComplete,
  });
}
