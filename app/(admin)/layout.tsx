import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { Wrench, LayoutDashboard, Users, Store, ShieldAlert, FileText } from "lucide-react";
import type { Database } from "@/types/database";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single<
      Pick<
        Database["public"]["Tables"]["profiles"]["Row"],
        "full_name" | "avatar_url" | "role"
      >
    >();

  // Ensure user is an admin
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    redirect("/unauthorised");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 font-bold text-indigo-400 text-lg"
              >
                <Wrench className="h-5 w-5" />
                FixBridge <span className="text-[10px] bg-indigo-900/50 px-1.5 py-0.5 rounded text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">Admin</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <NavLink href="/admin/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
                <NavLink href="/admin/users" icon={<Users className="w-4 h-4" />} label="Users" />
                <NavLink href="/admin/providers" icon={<Store className="w-4 h-4" />} label="Shops" />
                <NavLink href="/admin/disputes" icon={<ShieldAlert className="w-4 h-4" />} label="Disputes" />
                <NavLink href="/admin/audit" icon={<FileText className="w-4 h-4" />} label="Audit" />
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserDropdown user={profile} />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-sm text-slate-300 hover:text-white font-medium transition-colors"
    >
      {icon}
      {label}
    </Link>
  )
}
