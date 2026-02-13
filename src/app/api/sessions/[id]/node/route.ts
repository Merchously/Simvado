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
    include: { decisions: { orderBy: { decidedAt: "desc" }, take: 1 } },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Determine current node: if no decisions yet, get the first node; otherwise follow the chain
  let currentNodeKey: string | null = null;

  if (session.decisions.length === 0) {
    // First node in the module
    const firstNode = await db.decisionNode.findFirst({
      where: { moduleId: session.moduleId },
      orderBy: { sortOrder: "asc" },
    });
    currentNodeKey = firstNode?.nodeKey ?? null;
  } else {
    // Get the next node from the last decision
    const lastDecision = session.decisions[0];
    const selectedOption = await db.nodeOption.findUnique({
      where: { id: lastDecision.selectedOptionId },
    });
    currentNodeKey = selectedOption?.nextNodeKey ?? null;
  }

  if (!currentNodeKey) {
    return NextResponse.json(
      { error: "No more decisions" },
      { status: 400 }
    );
  }

  const node = await db.decisionNode.findUnique({
    where: {
      moduleId_nodeKey: {
        moduleId: session.moduleId,
        nodeKey: currentNodeKey,
      },
    },
    include: {
      options: {
        select: {
          id: true,
          optionKey: true,
          label: true,
          description: true,
        },
      },
    },
  });

  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  return NextResponse.json({
    nodeKey: node.nodeKey,
    promptText: node.promptText,
    timerSeconds: node.timerSeconds,
    preVideoUrl: node.preVideoUrl,
    contextDocuments: node.contextDocuments ?? [],
    options: node.options,
  });
}
