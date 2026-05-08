import {
  Users,
  Store,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  ShieldCheck
} from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
        <p className="text-gray-500 text-sm">Overview of platform health, users, and disputes.</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">1,284</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl text-green-600">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Verified Shops</p>
            <h3 className="text-2xl font-bold text-gray-900">156</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-xl text-red-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Open Disputes</p>
            <h3 className="text-2xl font-bold text-gray-900">12</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Verifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Shop Verifications</h2>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">4 Pending</span>
          </div>
          <div className="divide-y divide-gray-100">
            <PendingVerificationItem name="Quick Fix Hub" location="Delhi, DL" date="3h ago" />
            <PendingVerificationItem name="Metro Repairs" location="Bangalore, KA" date="5h ago" />
            <PendingVerificationItem name="Smart Tech" location="Mumbai, MH" date="Yesterday" />
          </div>
        </div>

        {/* Platform Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h2>
          <div className="space-y-4">
            <ActivityItem
              icon={<ClipboardList className="w-4 h-4" />}
              text="New ticket created by Aryan M."
              time="10 mins ago"
            />
            <ActivityItem
              icon={<ShieldCheck className="w-4 h-4" />}
              text="Shop 'TechFix' verified by Priya A."
              time="45 mins ago"
            />
            <ActivityItem
              icon={<TrendingUp className="w-4 h-4" />}
              text="Monthly target achieved: 500+ repairs"
              time="2 hours ago"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function PendingVerificationItem({ name, location, date }: any) {
  return (
    <div className="py-3 flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-900">{name}</h4>
        <p className="text-xs text-gray-500">{location}</p>
      </div>
      <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Review</button>
    </div>
  )
}

function ActivityItem({ icon, text, time }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 p-1.5 bg-gray-50 rounded text-gray-500">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-700">{text}</p>
        <p className="text-[10px] text-gray-400">{time}</p>
      </div>
    </div>
  )
}
