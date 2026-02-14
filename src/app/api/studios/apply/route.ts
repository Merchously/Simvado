import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, description, websiteUrl } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Studio name is required" },
      { status: 400 }
    );
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!slug) {
    return NextResponse.json(
      { error: "Studio name must contain at least one alphanumeric character" },
      { status: 400 }
    );
  }

  // Check slug uniqueness
  const existingSlug = await db.studio.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json(
      { error: "A studio with this name already exists. Please choose a different name." },
      { status: 409 }
    );
  }

  // Check user doesn't already have a pending or approved studio
  const existingStudio = await db.studio.findFirst({
    where: {
      ownerId: user.id,
      status: { in: ["pending", "approved"] },
    },
  });

  if (existingStudio) {
    return NextResponse.json(
      {
        error:
          existingStudio.status === "approved"
            ? "You already have an approved studio"
            : "You already have a pending studio application",
      },
      { status: 409 }
    );
  }

  try {
    const studio = await db.$transaction(async (tx) => {
      const newStudio = await tx.studio.create({
        data: {
          name: name.trim(),
          slug,
          description: description?.trim() || "",
          websiteUrl: websiteUrl?.trim() || null,
          status: "pending",
          ownerId: user.id,
        },
      });

      await tx.studioMember.create({
        data: {
          studioId: newStudio.id,
          userId: user.id,
          role: "owner",
        },
      });

      return newStudio;
    });

    return NextResponse.json(studio, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A studio with this name already exists. Please choose a different name." },
        { status: 409 }
      );
    }
    throw err;
  }
}
