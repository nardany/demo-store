import { readFile } from "node:fs/promises";
import path from "node:path";
import { READ_DIRS, contentTypes, safeFileName } from "@/lib/uploads";

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const name = safeFileName((await params).file);
  if (!name) return new Response("Not found", { status: 404 });

  for (const dir of READ_DIRS) {
    const data = await readFile(path.join(dir, name)).catch(() => null);
    if (!data) continue;
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypes[name.split(".").pop()!] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
  return new Response("Not found", { status: 404 });
}
