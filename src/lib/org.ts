import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * For server components — redirects on failure.
 */
export async function requireOrgAdmin(slug: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/dashboard");

  const org = await db.organization.findUnique({ where: { slug } });
  if (!org) redirect("/dashboard");

  const membership = await db.orgMembership.findFirst({
    where: { userId: user.id, organizationId: org.id, role: "admin" },
  });
  if (!membership) redirect("/dashboard");

  return { user, org, membership };
}

/**
 * For API routes — returns null on failure.
 */
export async function requireOrgAdminApi(slug: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return null;

  const org = await db.organization.findUnique({ where: { slug } });
  if (!org) return null;

  const membership = await db.orgMembership.findFirst({
    where: { userId: user.id, organizationId: org.id, role: "admin" },
  });
  if (!membership) return null;

  return { user, org, membership };
}
