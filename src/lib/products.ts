import { brand } from "@/brands";

export const FALLBACK_IMAGE = brand.images.fallback;

export const isExternalImage = (src: string) => !src.startsWith("/");

export function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [FALLBACK_IMAGE];
  try {
    const list = JSON.parse(raw);
    if (Array.isArray(list) && list.length > 0) return list.filter(Boolean);
  } catch {}
  return [raw];
}

export function parseSpecs(raw: string | null | undefined): [string, string][] {
  if (!raw) return [];
  try {
    return Object.entries(JSON.parse(raw)) as [string, string][];
  } catch {
    return [];
  }
}

export function parseImageList(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  let list: unknown;
  try {
    list = JSON.parse(raw);
  } catch {
    list = raw.split(/\s+/);
  }
  if (typeof list === "string") list = [list];
  if (!Array.isArray(list)) return [];
  const valid = list
    .filter((u): u is string => typeof u === "string")
    .map((u) => u.trim())
    .filter((u) => (u.startsWith("/") && !u.startsWith("//")) || u.startsWith("https://"));
  return [...new Set(valid)];
}

export function parseSpecsInput(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  let rows: [string, string][] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) rows = parsed.filter((r) => Array.isArray(r) && r.length === 2).map(([k, v]) => [String(k), String(v)]);
  } catch {
    rows = raw.split("\n").map((line) => {
      const i = line.search(/[:։=\t]/);
      return i > 0 ? [line.slice(0, i), line.slice(i + 1)] : ["", ""];
    });
  }
  const out: Record<string, string> = {};
  for (const [k, v] of rows) {
    const key = k.trim();
    const value = v.trim();
    if (key && value) out[key] = value;
  }
  return Object.keys(out).length ? JSON.stringify(out) : null;
}

export function discountPercent(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}
