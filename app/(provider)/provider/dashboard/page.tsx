import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";

export default function ProviderDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shop Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<AlertCircle className="w-6 h-6 text-blue-600" />}
          label="New Requests"
          value="5"
          trend="+2 since yesterday"
          color="bg-blue-50"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          label="In Repair"
          value="12"
          trend="3 due today"
          color="bg-orange-50"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
          label="Completed"
          value="28"
          trend="This month"
          color="bg-green-50"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          label="Revenue"
          value="₹12.4k"
          trend="+15% vs last month"
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <ActionLink
              href="/provider/jobs/new"
              icon={<PlusCircle className="w-5 h-5" />}
              title="Browse New Requests"
              description="View and quote for new repair requests"
            />
            <ActionLink
              href="/provider/jobs/active"
              icon={<ClipboardList className="w-5 h-5" />}
              title="Manage Active Jobs"
              description="Update status of ongoing repairs"
            />
            <ActionLink
              href="/provider/profile"
              icon={<Users className="w-5 h-5" />}
              title="Update Shop Profile"
              description="Manage services and availability"
            />
          </div>
        </div>

        {/* Recent Activity / Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Job Requests
            </h2>
            <Link
              href="/provider/jobs/new"
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <RecentJobItem
              device="iPhone 14 Pro"
              issue="Cracked Screen"
              customer="Aryan M."
              date="2h ago"
              status="New"
            />
            <RecentJobItem
              device="Dell XPS 15"
              issue="Battery Replacement"
              customer="Priya S."
              date="5h ago"
              status="Quoted"
            />
            <RecentJobItem
              device="PS5"
              issue="HDMI Port Repair"
              customer="Rahul K."
              date="Yesterday"
              status="New"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div
        className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      <p className="text-xs text-gray-400 mt-2">{trend}</p>
    </div>
  );
}

function ActionLink({ href, icon, title, description }: any) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all group"
    >
      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

function RecentJobItem({ device, issue, customer, date, status }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">{device}</h4>
          <p className="text-xs text-gray-500">
            {issue} • {customer}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            status === "New"
              ? "bg-blue-100 text-blue-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {status}
        </span>
        <p className="text-[10px] text-gray-400 mt-1">{date}</p>
      </div>
    </div>
  );
}
