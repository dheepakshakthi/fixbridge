import { Search, Filter, MoreVertical, Mail, Phone, Calendar } from "lucide-react"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">Manage customers and administrators across the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <UserRow
                name="Aryan Mehta"
                email="aryan@example.com"
                role="customer"
                status="Active"
                date="May 1, 2026"
              />
              <UserRow
                name="Priya Admin"
                email="priya@fixbridge.dev"
                role="admin"
                status="Active"
                date="Jan 15, 2026"
              />
              <UserRow
                name="Rahul Kapoor"
                email="rahul@example.com"
                role="customer"
                status="Suspended"
                date="Apr 10, 2026"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function UserRow({ name, email, role, status, date }: any) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {role}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">{status}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {date}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
          <MoreVertical className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}
