import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * For server components — redirects on failure.
 * Requires any StudioMember role; studio must be approved.
 */
export async function requireStudioMember(slug: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/dashboard");

  const studio = await db.studio.findUnique({ where: { slug } });
  if (!studio || studio.status !== "approved") redirect("/dashboard");

  const membership = await db.studioMember.findFirst({
    where: { userId: user.id, studioId: studio.id },
  });
  if (!membership) redirect("/dashboard");

  return { user, studio, membership };
}

/**
 * For server components — redirects on failure.
 * Requires owner or admin role.
 */
export async function requireStudioAdmin(slug: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/dashboard");

  const studio = await db.studio.findUnique({ where: { slug } });
  if (!studio || studio.status !== "approved") redirect("/dashboard");

  const membership = await db.studioMember.findFirst({
    where: {
      userId: user.id,
      studioId: studio.id,
      role: { in: ["owner", "admin"] },
    },
  });
  if (!membership) redirect("/dashboard");

  return { user, studio, membership };
}

/**
 * For API routes — returns null on failure.
 */
export async function requireStudioMemberApi(slug: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return null;

  const studio = await db.studio.findUnique({ where: { slug } });
  if (!studio || studio.status !== "approved") return null;

  const membership = await db.studioMember.findFirst({
    where: { userId: user.id, studioId: studio.id },
  });
  if (!membership) return null;

  return { user, studio, membership };
}

/**
 * For API routes — returns null on failure.
 * Requires owner or admin role.
 */
export async function requireStudioAdminApi(slug: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return null;

  const studio = await db.studio.findUnique({ where: { slug } });
  if (!studio || studio.status !== "approved") return null;

  const membership = await db.studioMember.findFirst({
    where: {
      userId: user.id,
      studioId: studio.id,
      role: { in: ["owner", "admin"] },
    },
  });
  if (!membership) return null;

  return { user, studio, membership };
}
