import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiKey } from "@/lib/api-keys";

type Props = { params: Promise<{ id: string }> };

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

  const session = await db.session.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      module: { select: { id: true, title: true, slug: true } },
      gameEvents: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}
