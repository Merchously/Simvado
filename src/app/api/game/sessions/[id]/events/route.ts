import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiKey } from "@/lib/api-keys";
import type { GameEventType } from "@prisma/client";

type Props = { params: Promise<{ id: string }> };

const VALID_EVENT_TYPES: GameEventType[] = [
  "decision",
  "milestone",
  "score_update",
  "completion",
  "custom",
];

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

  const session = await db.session.findUnique({ where: { id } });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = await req.json();
  const events: { eventType: string; eventData: unknown; timestamp?: string }[] =
    Array.isArray(body) ? body : [body];

  const created = [];
  for (const { eventType, eventData, timestamp } of events) {
    if (!VALID_EVENT_TYPES.includes(eventType as GameEventType)) {
      return NextResponse.json(
        { error: `Invalid eventType: ${eventType}` },
        { status: 400 }
      );
    }

    const event = await db.gameEvent.create({
      data: {
        sessionId: id,
        eventType: eventType as GameEventType,
        eventData: (eventData as object) ?? {},
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });
    created.push(event.id);
  }

  return NextResponse.json({ eventIds: created }, { status: 201 });
}

export async function GET(req: Request, { params }: Props) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const keyRecord = await verifyApiKey(authHeader.slice(7));
  if (!keyRecord) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { id } = await params;

  const events = await db.gameEvent.findMany({
    where: { sessionId: id },
    orderBy: { timestamp: "asc" },
  });

  return NextResponse.json(events);
}
