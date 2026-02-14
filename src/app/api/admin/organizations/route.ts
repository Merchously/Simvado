import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const orgs = await db.organization.findMany({
    include: {
      _count: { select: { memberships: true, sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orgs);
}

export async function POST(req: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, slug, plan = "pilot", seatLimit = 25, adminEmail } =
    await req.json();

  if (!name || !slug || !adminEmail) {
    return NextResponse.json(
      { error: "name, slug, and adminEmail are required" },
      { status: 400 }
    );
  }

  // Check slug uniqueness
  const existing = await db.organization.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Slug already taken" },
      { status: 409 }
    );
  }

  // Find admin user
  const adminUser = await db.user.findFirst({ where: { email: adminEmail } });
  if (!adminUser) {
    return NextResponse.json(
      { error: "Admin user not found. They must sign up first." },
      { status: 404 }
    );
  }

  // Create org + membership in transaction
  const org = await db.$transaction(async (tx) => {
    const newOrg = await tx.organization.create({
      data: { name, slug, plan, seatLimit },
    });

    await tx.orgMembership.create({
      data: {
        userId: adminUser.id,
        organizationId: newOrg.id,
        role: "admin",
      },
    });

    await tx.user.update({
      where: { id: adminUser.id },
      data: {
        organizationId: newOrg.id,
        role: "enterprise_admin",
        subscriptionTier: "enterprise",
      },
    });

    return newOrg;
  });

  return NextResponse.json(org, { status: 201 });
}
