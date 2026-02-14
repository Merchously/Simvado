import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("REDIRECT");
  }),
}));

import { requireAdminApi } from "@/lib/admin";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

describe("requireAdminApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when not authenticated", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: null });
    const result = await requireAdminApi();
    expect(result).toBeNull();
  });

  it("returns null when user not found", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "clerk_123" });
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await requireAdminApi();
    expect(result).toBeNull();
  });

  it("returns null when user is not platform_admin", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "clerk_123" });
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      role: "individual",
    });
    const result = await requireAdminApi();
    expect(result).toBeNull();
  });

  it("returns user when user is platform_admin", async () => {
    const mockUser = { id: "user-1", role: "platform_admin" };
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: "clerk_123" });
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
    const result = await requireAdminApi();
    expect(result).toEqual(mockUser);
  });
});
