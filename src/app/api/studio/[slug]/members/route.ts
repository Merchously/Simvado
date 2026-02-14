import { NextResponse } from "next/server";
import {
  requireStudioMemberApi,
  requireStudioAdminApi,
} from "@/lib/studio";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioMemberApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const members = await db.studioMember.findMany({
    where: { studioId: ctx.studio.id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireStudioAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email, role = "member" } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  if (role !== "admin" && role !== "member") {
    return NextResponse.json(
      { error: "role must be 'admin' or 'member'" },
      { status: 400 }
    );
  }

  const user = await db.user.findFirst({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "User not found. They must sign up first." },
      { status: 404 }
    );
  }

  const existing = await db.studioMember.findFirst({
    where: { userId: user.id, studioId: ctx.studio.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Already a member" },
      { status: 409 }
    );
  }

  const membership = await db.studioMember.create({
    data: {
      userId: user.id,
      studioId: ctx.studio.id,
      role,
    },
  });

  // Update user role to studio_creator if not already
  if (user.role !== "studio_creator" && user.role !== "platform_admin") {
    await db.user.update({
      where: { id: user.id },
      data: { role: "studio_creator" },
    });
  }

  return NextResponse.json(membership, { status: 201 });
}
