import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/app/components/admin/AdminLoginForm";
import { adminAuth } from "@/lib/firebase/admin";

export default async function AdminPage() {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get(
    "transtoledo_session"
  )?.value;

  if (sessionCookie) {
    try {
      await adminAuth.verifySessionCookie(
        sessionCookie,
        true
      );

      redirect("/admin/dashboard");
    } catch {
      // Sessão inválida ou expirada.
      // Exibe a tela de login.
    }
  }

  return <AdminLoginForm />;
}