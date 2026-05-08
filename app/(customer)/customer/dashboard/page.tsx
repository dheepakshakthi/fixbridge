import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TicketCard } from "@/components/ui/TicketCard";
import { Button } from "@/components/ui/Button";
import { Plus, Wrench, Clock, CheckCircle, FileText } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function CustomerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [openRes, repairRes, completedRes, quotesRes, recentRes] =
    await Promise.all([
      supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id)
        .in("status", ["submitted", "quoted", "accepted"]),
      supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id)
        .eq("status", "in_repair"),
      supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id)
        .eq("status", "completed")
        .gte("updated_at", new Date(new Date().setDate(1)).toISOString()),
      supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id)
        .eq("status", "quoted"),
      supabase
        .from("tickets")
        .select("*, service_providers(shop_name, city)")
        .eq("customer_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    {
      label: "Open Tickets",
      value: openRes.count ?? 0,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "In Repair",
      value: repairRes.count ?? 0,
      icon: Wrench,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Completed (Month)",
      value: completedRes.count ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending Quotes",
      value: quotesRes.count ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
  ];

  const recentTickets = recentRes.data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and manage your repair requests
          </p>
        </div>
        <Link href="/customer/tickets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Tickets
          </h2>
          <Link
            href="/customer/tickets"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            View all
          </Link>
        </div>

        {recentTickets && recentTickets.length > 0 ? (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} portal="customer" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Wrench className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No repair requests yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Submit your first repair request to get started
            </p>
            <Link href="/customer/tickets/new" className="mt-4 inline-block">
              <Button size="sm">Raise a Request</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
