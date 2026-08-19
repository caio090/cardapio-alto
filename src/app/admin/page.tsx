import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage() {
  if (await hasValidAdminSession()) {
    redirect("/admin/produtos");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium text-[#1a1a1a]/50">Cardápio Alto</p>
        <h1 className="mt-1 text-2xl font-bold">Acesso administrativo</h1>
        <AdminLoginForm />
      </div>
    </main>
  );
}
