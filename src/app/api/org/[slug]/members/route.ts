import { NextResponse } from "next/server";
import { requireOrgAdminApi } from "@/lib/org";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const members = await db.orgMembership.findMany({
    where: { organizationId: ctx.org.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          _count: { select: { sessions: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: Request, { params }: Props) {
  const { slug } = await params;
  const ctx = await requireOrgAdminApi(slug);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email, role = "participant", department } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  // Check seat limit
  const memberCount = await db.orgMembership.count({
    where: { organizationId: ctx.org.id },
  });
  if (memberCount >= ctx.org.seatLimit) {
    return NextResponse.json({ error: "Seat limit reached" }, { status: 400 });
  }

  // Find or note the user
  const user = await db.user.findFirst({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "User not found. They must sign up first." },
      { status: 404 }
    );
  }

  // Check not already a member
  const existing = await db.orgMembership.findFirst({
    where: { userId: user.id, organizationId: ctx.org.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Already a member" },
      { status: 409 }
    );
  }

  const membership = await db.orgMembership.create({
    data: {
      userId: user.id,
      organizationId: ctx.org.id,
      role,
      department: department || null,
    },
  });

  // Set the user's organizationId
  await db.user.update({
    where: { id: user.id },
    data: { organizationId: ctx.org.id },
  });

  return NextResponse.json(membership, { status: 201 });
}
