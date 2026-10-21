import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { saveUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Մուտք գործեք" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ֆայլ չի ընտրվել" }, { status: 400 });
  }

  try {
    return NextResponse.json({ url: await saveUpload(file) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Չհաջողվեց պահպանել" }, { status: 400 });
  }
}
