import { ClipboardList, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ActiveJobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Jobs</h1>
        <p className="text-gray-500 text-sm">Manage repairs currently in progress at your shop.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Device / Issue</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <JobRow
                id="4"
                device="MacBook Pro M2"
                issue="Keyboard Spill"
                customer="Zoya R."
                status="In Repair"
                timeline="Started 2 days ago"
              />
              <JobRow
                id="5"
                device="Xbox Series X"
                issue="Disc Drive Error"
                customer="Vikram P."
                status="Accepted"
                timeline="Awaiting Dropoff"
              />
              <JobRow
                id="6"
                device="Pixel 7 Pro"
                issue="Battery Bloated"
                customer="Anil T."
                status="Ready"
                timeline="Finished today"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function JobRow({ id, device, issue, customer, status, timeline }: any) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded text-indigo-600">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{device}</p>
            <p className="text-xs text-gray-500">{issue}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{customer}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          status === 'In Repair' ? 'bg-orange-100 text-orange-700' :
          status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeline}
        </div>
      </td>
      <td className="px-6 py-4">
        <Link href={`/provider/jobs/active/${id}`} className="p-1 hover:bg-gray-200 rounded transition-colors block w-fit">
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </Link>
      </td>
    </tr>
  )
}
