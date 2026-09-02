import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { adminAuth } from "@/lib/firebase/admin";

type AdminPanelLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AdminPanelLayout({
  children,
}: AdminPanelLayoutProps) {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get(
    "transtoledo_session"
  )?.value;

  if (!sessionCookie) {
    redirect("/admin");
  }

  try {
    await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );
  } catch {
    redirect("/admin");
  }

  return (
    <div className="min-h-dvh bg-[#07090b] text-white">
      <AdminSidebar />

      <main className="min-h-dvh pt-18 lg:pl-72 lg:pt-0">
        {children}
      </main>
    </div>
  );
}