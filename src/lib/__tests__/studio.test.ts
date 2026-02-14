import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    studio: { findUnique: vi.fn() },
    studioMember: { findFirst: vi.fn() },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("REDIRECT");
  }),
}));

import { requireStudioMemberApi, requireStudioAdminApi } from "@/lib/studio";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockFindUser = db.user.findUnique as ReturnType<typeof vi.fn>;
const mockFindStudio = db.studio.findUnique as ReturnType<typeof vi.fn>;
const mockFindMember = db.studioMember.findFirst as ReturnType<typeof vi.fn>;

describe("requireStudioMemberApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });
    expect(await requireStudioMemberApi("test-studio")).toBeNull();
  });

  it("returns null when user not found", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockFindUser.mockResolvedValue(null);
    expect(await requireStudioMemberApi("test-studio")).toBeNull();
  });

  it("returns null when studio not found", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockFindUser.mockResolvedValue({ id: "u1" });
    mockFindStudio.mockResolvedValue(null);
    expect(await requireStudioMemberApi("test-studio")).toBeNull();
  });

  it("returns null when studio is not approved", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockFindUser.mockResolvedValue({ id: "u1" });
    mockFindStudio.mockResolvedValue({ id: "s1", status: "pending" });
    expect(await requireStudioMemberApi("test-studio")).toBeNull();
  });

  it("returns null when user is not a member", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockFindUser.mockResolvedValue({ id: "u1" });
    mockFindStudio.mockResolvedValue({ id: "s1", slug: "test-studio", status: "approved" });
    mockFindMember.mockResolvedValue(null);
    expect(await requireStudioMemberApi("test-studio")).toBeNull();
  });

  it("returns context when user is a member", async () => {
    const user = { id: "u1" };
    const studio = { id: "s1", slug: "test-studio", status: "approved" };
    const membership = { id: "m1", role: "member" };
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockFindUser.mockResolvedValue(user);
    mockFindStudio.mockResolvedValue(studio);
    mockFindMember.mockResolvedValue(membership);

    const result = await requireStudioMemberApi("test-studio");
    expect(result).toEqual({ user, studio, membership });
  });
});

describe("requireStudioAdminApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when member has insufficient role", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockFindUser.mockResolvedValue({ id: "u1" });
    mockFindStudio.mockResolvedValue({ id: "s1", slug: "test-studio", status: "approved" });
    mockFindMember.mockResolvedValue(null);
    expect(await requireStudioAdminApi("test-studio")).toBeNull();
  });

  it("returns context when user is studio admin", async () => {
    const user = { id: "u1" };
    const studio = { id: "s1", slug: "test-studio", status: "approved" };
    const membership = { id: "m1", role: "admin" };
    mockAuth.mockResolvedValue({ userId: "clerk_123" });
    mockFindUser.mockResolvedValue(user);
    mockFindStudio.mockResolvedValue(studio);
    mockFindMember.mockResolvedValue(membership);

    const result = await requireStudioAdminApi("test-studio");
    expect(result).toEqual({ user, studio, membership });
  });
});
