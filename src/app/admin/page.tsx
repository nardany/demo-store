import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await verifySession()) redirect("/admin/dashboard");
  return <LoginForm />;
}
