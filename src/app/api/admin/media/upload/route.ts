import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const moduleId = formData.get("moduleId") as string | null;
  const type = formData.get("type") as string | null;

  if (!file || !moduleId || !type) {
    return NextResponse.json(
      { error: "file, moduleId, and type are required" },
      { status: 400 }
    );
  }

  const validTypes = ["video", "image", "audio", "document"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const simModule = await db.module.findUnique({ where: { id: moduleId } });
  if (!simModule) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() ?? "bin";
  const key = `modules/${moduleId}/${randomUUID()}.${ext}`;

  const url = await uploadFile(key, buffer, file.type);

  const asset = await db.mediaAsset.create({
    data: {
      moduleId,
      type,
      url,
      filename: file.name,
      sizeBytes: BigInt(buffer.length),
    },
  });

  return NextResponse.json(
    { id: asset.id, url: asset.url, filename: asset.filename },
    { status: 201 }
  );
}
