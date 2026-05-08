import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { UserDropdown } from "@/components/shared/UserDropdown";
import { Wrench } from "lucide-react";
import type { Database } from "@/types/database";

export default async function CustomerLayout({
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
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single<
      Pick<
        Database["public"]["Tables"]["profiles"]["Row"],
        "full_name" | "avatar_url"
      >
    >();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/customer/dashboard"
                className="flex items-center gap-2 font-bold text-indigo-600 text-lg"
              >
                <Wrench className="h-5 w-5" />
                FixBridge
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/customer/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/customer/tickets"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  My Tickets
                </Link>
                <Link
                  href="/customer/providers"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Find Providers
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
