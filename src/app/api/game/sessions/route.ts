import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiKey } from "@/lib/api-keys";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const keyRecord = await verifyApiKey(authHeader.slice(7));
  if (!keyRecord) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { userId, moduleId, externalSessionId, platform } = await req.json();

  if (!userId || !moduleId) {
    return NextResponse.json(
      { error: "userId and moduleId are required" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const simModule = await db.module.findUnique({ where: { id: moduleId } });
  if (!simModule) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const session = await db.session.create({
    data: {
      userId,
      moduleId,
      organizationId: user.organizationId,
      externalSessionId: externalSessionId ?? undefined,
      platform: platform ?? simModule.platform ?? "other",
      launchUrl: simModule.launchUrl,
    },
  });

  return NextResponse.json(
    {
      sessionId: session.id,
      externalSessionId: session.externalSessionId,
    },
    { status: 201 }
  );
}
