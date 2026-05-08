import Link from "next/link"
import { ClipboardList, Search, Filter, ArrowRight } from "lucide-react"

export default function NewJobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Repair Requests</h1>
          <p className="text-gray-500 text-sm">Browse requests from customers and submit your quotes.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <JobCard
          id="1"
          device="iPhone 14 Pro"
          brand="Apple"
          issue="Cracked back glass and rear camera not focusing"
          customer="Aryan M."
          location="Mumbai, MH"
          urgency="Urgent"
          date="2 hours ago"
        />
        <JobCard
          id="2"
          device="PS5"
          brand="Sony"
          issue="HDMI port damaged, no display output"
          customer="Rahul K."
          location="Pune, MH"
          urgency="Standard"
          date="5 hours ago"
        />
        <JobCard
          id="3"
          device="XPS 15 9500"
          brand="Dell"
          issue="Intermittent screen flickering when moving the lid"
          customer="Sanya V."
          location="Mumbai, MH"
          urgency="Flexible"
          date="Yesterday"
        />
      </div>
    </div>
  )
}

function JobCard({ id, device, brand, issue, customer, location, urgency, date }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{device}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                urgency === 'Urgent' ? 'bg-red-100 text-red-700' :
                urgency === 'Standard' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {urgency}
              </span>
            </div>
            <p className="text-sm text-gray-500">{brand} • {customer} • {location}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">{date}</p>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-6">
        {issue}
      </p>

      <div className="flex items-center justify-end">
        <Link
          href={`/provider/jobs/new/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          View Details & Quote
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
