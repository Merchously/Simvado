import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn().mockResolvedValue({});

vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: class {
      send = mockSend;
    },
    PutObjectCommand: vi.fn(),
    DeleteObjectCommand: vi.fn(),
    GetObjectCommand: vi.fn(),
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://signed-url.example.com"),
}));

process.env.R2_ACCOUNT_ID = "test-account";
process.env.R2_ACCESS_KEY_ID = "test-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.R2_PUBLIC_URL = "https://cdn.test.com";

import { uploadFile, deleteFile, getSignedDownloadUrl } from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("uploadFile returns public URL", async () => {
    const url = await uploadFile("test/file.png", Buffer.from("data"), "image/png");
    expect(url).toBe("https://cdn.test.com/test/file.png");
    expect(mockSend).toHaveBeenCalledOnce();
  });

  it("deleteFile calls S3 send", async () => {
    await expect(deleteFile("test/file.png")).resolves.not.toThrow();
    expect(mockSend).toHaveBeenCalledOnce();
  });

  it("getSignedDownloadUrl returns a URL", async () => {
    const url = await getSignedDownloadUrl("test/file.png");
    expect(url).toBe("https://signed-url.example.com");
  });
});
