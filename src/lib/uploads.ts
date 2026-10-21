import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isEphemeral } from "./runtime";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || (isEphemeral ? "/tmp/uploads" : "storage/uploads"));
export const READ_DIRS = [...new Set([UPLOAD_DIR, path.resolve("storage/uploads")])];
export const MEDIA_PREFIX = "/media/";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const isBlobUrl = (url: string) => /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url);

export const isUploadedUrl = (url: string) => url.startsWith(MEDIA_PREFIX) || isBlobUrl(url);

const signatures: { ext: string; type: string; test: (b: Buffer) => boolean }[] = [
  { ext: "jpg", type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", type: "image/png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "webp", type: "image/webp", test: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  { ext: "gif", type: "image/gif", test: (b) => b.toString("ascii", 0, 4) === "GIF8" },
];

export const contentTypes: Record<string, string> = Object.fromEntries(signatures.map((s) => [s.ext, s.type]));

export async function saveUpload(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Ֆայլը 10ՄԲ-ից մեծ է");
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = signatures.find((s) => s.test(buffer));
  if (!kind) throw new Error("Թույլատրված են միայն JPG, PNG, WEBP և GIF նկարներ");

  const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${kind.ext}`;

  if (useBlob) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${name}`, buffer, { access: "public", contentType: kind.type, addRandomSuffix: false });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), buffer);
  return `${MEDIA_PREFIX}${name}`;
}

export function safeFileName(name: string) {
  return /^[a-z0-9-]+\.(jpg|png|webp|gif)$/.test(name) ? name : null;
}

export async function deleteUploads(urls: string[]) {
  const blobs = urls.filter(isBlobUrl);
  if (blobs.length && useBlob) {
    const { del } = await import("@vercel/blob");
    await del(blobs).catch(() => {});
  }

  for (const url of urls) {
    if (!url.startsWith(MEDIA_PREFIX)) continue;
    const name = safeFileName(url.slice(MEDIA_PREFIX.length));
    if (name) await unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
  }
}
