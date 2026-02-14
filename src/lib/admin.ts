import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/** For server components — redirects if not platform_admin. */
export async function requireAdmin() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "platform_admin") redirect("/dashboard");

  return user;
}

/** For API routes — returns null if not platform_admin. */
export async function requireAdminApi() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "platform_admin") return null;

  return user;
}
