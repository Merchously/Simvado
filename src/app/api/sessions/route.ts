import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { moduleId } = await req.json();
  if (!moduleId) {
    return NextResponse.json(
      { error: "moduleId is required" },
      { status: 400 }
    );
  }

  const simModule = await db.module.findUnique({
    where: { id: moduleId },
    include: { simulation: true },
  });

  if (!simModule || simModule.status !== "published") {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  // Check access: free users can only play free demo modules
  if (
    user.subscriptionTier === "free" &&
    !simModule.isFreeDemo
  ) {
    return NextResponse.json(
      { error: "Upgrade to Pro to access this module" },
      { status: 403 }
    );
  }

  const session = await db.session.create({
    data: {
      userId: user.id,
      moduleId: simModule.id,
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json({ sessionId: session.id }, { status: 201 });
}
