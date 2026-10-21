"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clearFailedLogins, createSession, loginBlockedFor, logoutSession, recordFailedLogin, verifySession } from "@/lib/auth";
import { FALLBACK_IMAGE, parseImageList, parseSpecsInput } from "@/lib/products";
import { parseAmount } from "@/lib/search";
import { deleteUploads, isUploadedUrl } from "@/lib/uploads";

export type ActionResult = { error?: string; ok?: string } | null;

async function requireAdmin() {
  if (!(await verifySession())) throw new Error("Unauthorized");
}

function refreshPublic() {
  revalidatePath("/", "layout");
}

const str = (fd: FormData, key: string) => ((fd.get(key) as string | null) ?? "").trim();


export async function loginAdmin(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = str(formData, "email").toLowerCase();
  const password = (formData.get("password") as string) ?? "";
  if (!email || !password) return { error: "Լրացրեք բոլոր դաշտերը" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  const wait = loginBlockedFor(ip);
  if (wait) return { error: `Շատ սխալ փորձեր։ Փորձեք ${wait} րոպեից` };

  const user = await db.user.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!valid) {
    recordFailedLogin(ip);
    return { error: "Սխալ էլ. փոստ կամ գաղտնաբառ" };
  }

  clearFailedLogins(ip);
  await createSession(email, formData.get("remember") === "on");
  redirect("/admin/dashboard");
}

export async function logoutAdminAction() {
  await logoutSession();
  redirect("/admin");
}


const armenianToLatin: Record<string, string> = {
  ա: "a", բ: "b", գ: "g", դ: "d", ե: "e", զ: "z", է: "e", ը: "y", թ: "t", ժ: "zh", ի: "i", լ: "l", խ: "kh",
  ծ: "ts", կ: "k", հ: "h", ձ: "dz", ղ: "gh", ճ: "ch", մ: "m", յ: "y", ն: "n", շ: "sh", ո: "o", չ: "ch",
  պ: "p", ջ: "j", ռ: "r", ս: "s", վ: "v", տ: "t", ր: "r", ց: "c", ւ: "v", փ: "p", ք: "q", և: "ev", օ: "o", ֆ: "f",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ու/g, "u")
    .split("")
    .map((ch) => armenianToLatin[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string, exceptId?: string) {
  const root = base || "bazhin";
  let slug = root;
  for (let i = 2; ; i++) {
    const existing = await db.category.findUnique({ where: { slug } });
    if (!existing || existing.id === exceptId) return slug;
    slug = `${root}-${i}`;
  }
}

export async function saveCategoryAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = str(formData, "id");
  const name = str(formData, "name");
  const parentId = str(formData, "parentId") || null;
  const image = parseImageList(str(formData, "image"))[0] ?? null;
  if (!name) return { error: "Անվանումը պարտադիր է" };

  if (parentId) {
    if (parentId === id) return { error: "Բաժինը չի կարող լինել իր իսկ ենթաբաժինը" };
    const parent = await db.category.findUnique({ where: { id: parentId } });
    if (!parent || parent.parentId) return { error: "Մայր բաժին կարող է լինել միայն գլխավոր բաժինը" };
    if (id && (await db.category.count({ where: { parentId: id } })) > 0) {
      return { error: "Այս բաժինն ունի ենթաբաժիններ, այն չի կարող դառնալ ենթաբաժին" };
    }
  }

  const slug = await uniqueSlug(slugify(str(formData, "slug") || name), id || undefined);

  if (id) {
    const before = await db.category.findUnique({ where: { id }, select: { image: true } });
    await db.category.update({ where: { id }, data: { name, slug, parentId, image } });
    if (before?.image && before.image !== image) await removeIfUnused([before.image]);
  } else {
    const last = await db.category.findFirst({ where: { parentId }, orderBy: { sortOrder: "desc" } });
    await db.category.create({ data: { name, slug, parentId, image, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  }

  refreshPublic();
  if (id) redirect("/admin/dashboard?tab=categories");
  return { ok: "Բաժինն ավելացվեց" };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const [children, products] = await Promise.all([
    db.category.count({ where: { parentId: id } }),
    db.product.count({ where: { categoryId: id } }),
  ]);
  if (children > 0) return { error: `Նախ ջնջեք կամ տեղափոխեք ${children} ենթաբաժինը` };
  if (products > 0) return { error: `Բաժնում կա ${products} ապրանք։ Նախ տեղափոխեք դրանք` };

  const removed = await db.category.delete({ where: { id } });
  if (removed.image) await removeIfUnused([removed.image]);
  refreshPublic();
  return { ok: "Բաժինը ջնջվեց" };
}

export async function moveCategoryAction(id: string, direction: "up" | "down") {
  await requireAdmin();

  const current = await db.category.findUnique({ where: { id } });
  if (!current) return;
  const siblings = await db.category.findMany({
    where: { parentId: current.parentId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const index = siblings.findIndex((c) => c.id === id);
  const swapWith = siblings[direction === "up" ? index - 1 : index + 1];
  if (!swapWith) return;

  const reordered = [...siblings];
  reordered[index] = swapWith;
  reordered[siblings.indexOf(swapWith)] = current;
  await db.$transaction(reordered.map((c, i) => db.category.update({ where: { id: c.id }, data: { sortOrder: i } })));

  refreshPublic();
}


export async function saveProductAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = str(formData, "id");
  const title = str(formData, "title");
  const description = str(formData, "description");
  const categoryId = str(formData, "categoryId");
  const price = parseAmount(str(formData, "price"));
  const oldPrice = parseAmount(str(formData, "oldPrice"));
  const images = parseImageList(str(formData, "images"));

  if (!title || !description || !categoryId) return { error: "Լրացրեք անվանումը, նկարագրությունը և բաժինը" };
  if (price === null) return { error: "Նշեք գինը" };
  if (oldPrice !== null && oldPrice <= price) return { error: "Հին գինը պետք է մեծ լինի նոր գնից (կամ թողեք դատարկ)" };
  if (!(await db.category.findUnique({ where: { id: categoryId } }))) return { error: "Ընտրված բաժինը գոյություն չունի" };

  const data = {
    title,
    description,
    categoryId,
    price,
    oldPrice,
    images: JSON.stringify(images.length ? images : [FALLBACK_IMAGE]),
    specs: parseSpecsInput(str(formData, "specs")),
    inStock: formData.get("inStock") === "on",
    isNew: formData.get("isNew") === "on",
    requiresLicense: formData.get("requiresLicense") === "on",
  };

  if (id) {
    const before = await db.product.findUnique({ where: { id }, select: { images: true } });
    if (!before) return { error: "Ապրանքը չի գտնվել (հնարավոր է՝ ջնջվել է)" };
    await db.product.update({ where: { id }, data });
    await removeIfUnused(parseImageList(before.images).filter((url) => !images.includes(url)));
  } else {
    await db.product.create({ data });
  }

  refreshPublic();
  if (id) redirect("/admin/dashboard?tab=products&saved=1");
  return { ok: "Ապրանքն ավելացվեց" };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const removed = await db.product.delete({ where: { id } });
  await removeIfUnused(parseImageList(removed.images));
  refreshPublic();
}

async function removeIfUnused(urls: string[]) {
  const uploaded = urls.filter(isUploadedUrl);
  if (!uploaded.length) return;
  const [products, categories] = await Promise.all([
    db.product.findMany({ select: { images: true } }),
    db.category.findMany({ select: { image: true } }),
  ]);
  const inUse = new Set([...products.flatMap((p) => parseImageList(p.images)), ...categories.map((c) => c.image)]);
  await deleteUploads(uploaded.filter((u) => !inUse.has(u)));
}


export async function updatePromoBannerAction(formData: FormData) {
  await requireAdmin();

  const text = str(formData, "text");
  const isActive = formData.get("isActive") === "on";
  const existing = await db.promoBanner.findFirst();
  if (existing) await db.promoBanner.update({ where: { id: existing.id }, data: { text, isActive } });
  else await db.promoBanner.create({ data: { text, isActive } });

  refreshPublic();
}
