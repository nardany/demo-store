
export function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/և/g, "եւ")
    .replace(/[«»"'`.,;:։՝()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchTokens(query: string) {
  return normalize(query).split(" ").filter(Boolean);
}

type Searchable = {
  title: string;
  description: string;
  specs?: string | null;
  category?: { name: string; parent?: { name: string } | null } | null;
};

function haystack(p: Searchable) {
  return normalize([p.title, p.description, p.specs ?? "", p.category?.name ?? "", p.category?.parent?.name ?? ""].join(" "));
}

export function matchProducts<T extends Searchable>(products: T[], query: string): T[] {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return products;

  return products
    .map((p) => {
      const text = haystack(p);
      if (!tokens.every((t) => text.includes(t))) return null;
      const title = normalize(p.title);
      const score = tokens.reduce((s, t) => s + (title.includes(t) ? 2 : 0) + (title.startsWith(t) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((x): x is { p: T; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

// "25.000", "25 000", "25,000" → 25000
// "25000.00", "1500,5" → կոպեկները (վերջին 1–2 նիշը կետից հետո) անտեսվում են
export function parseAmount(value: string | string[] | null | undefined): number | null {
  const raw = (Array.isArray(value) ? value[0] : value) ?? "";
  const digits = raw.trim().replace(/[.,]\d{1,2}$/, "").replace(/\D/g, "");
  return digits ? Number(digits) : null;
}
