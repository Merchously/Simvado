import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";

vi.mock("@/lib/db", () => ({
  db: {
    apiKey: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { generateApiKey, verifyApiKey } from "@/lib/api-keys";
import { db } from "@/lib/db";

describe("generateApiKey", () => {
  it("returns key, hash, and prefix", () => {
    const result = generateApiKey();
    expect(result.key).toMatch(/^sk_sim_[a-f0-9]{64}$/);
    expect(result.prefix).toBe(result.key.slice(0, 15));
    expect(result.hash).toBe(
      createHash("sha256").update(result.key).digest("hex")
    );
  });

  it("generates unique keys each time", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.key).not.toBe(b.key);
    expect(a.hash).not.toBe(b.hash);
  });
});

describe("verifyApiKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for non-existent key", async () => {
    (db.apiKey.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await verifyApiKey("sk_sim_nonexistent");
    expect(result).toBeNull();
  });

  it("returns null for inactive key", async () => {
    (db.apiKey.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "test-id",
      isActive: false,
      expiresAt: null,
    });
    const result = await verifyApiKey("sk_sim_test");
    expect(result).toBeNull();
  });

  it("returns null for expired key", async () => {
    (db.apiKey.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "test-id",
      isActive: true,
      expiresAt: new Date("2020-01-01"),
    });
    const result = await verifyApiKey("sk_sim_test");
    expect(result).toBeNull();
  });

  it("returns record and updates lastUsedAt for valid key", async () => {
    const mockRecord = { id: "test-id", isActive: true, expiresAt: null };
    (db.apiKey.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockRecord);
    (db.apiKey.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockRecord);

    const result = await verifyApiKey("sk_sim_test");
    expect(result).toEqual(mockRecord);
    expect(db.apiKey.update).toHaveBeenCalledWith({
      where: { id: "test-id" },
      data: { lastUsedAt: expect.any(Date) },
    });
  });
});
