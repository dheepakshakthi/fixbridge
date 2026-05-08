import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { Wrench, LayoutDashboard, ClipboardList, Store } from "lucide-react";
import type { Database } from "@/types/database";

export default async function ProviderLayout({
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

  // Ensure user is a provider or admin
  if (profile?.role !== "provider" && profile?.role !== "admin" && profile?.role !== "super_admin") {
    redirect("/unauthorised");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/provider/dashboard"
                className="flex items-center gap-2 font-bold text-indigo-600 text-lg"
              >
                <Wrench className="h-5 w-5" />
                FixBridge <span className="text-[10px] bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-700 uppercase tracking-widest">Shop</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/provider/dashboard"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/provider/jobs/new"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  <ClipboardList className="w-4 h-4" />
                  New Requests
                </Link>
                <Link
                  href="/provider/jobs/active"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  <Store className="w-4 h-4" />
                  Active Jobs
                </Link>
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
