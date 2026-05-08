import { Search, Filter, ShieldCheck, ShieldAlert, Star, MapPin } from "lucide-react"

export default function AdminProvidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Shop Management</h1>
          <p className="text-gray-500 text-sm">Monitor and manage service providers on the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProviderCard
          name="TechFix Solutions"
          location="Mumbai, MH"
          rating={4.8}
          reviews={124}
          verified={true}
          status="Active"
        />
        <ProviderCard
          name="Quick Fix Hub"
          location="Delhi, DL"
          rating={4.5}
          reviews={89}
          verified={false}
          status="Pending Review"
        />
        <ProviderCard
          name="Metro Repairs"
          location="Bangalore, KA"
          rating={4.9}
          reviews={210}
          verified={true}
          status="Active"
        />
      </div>
    </div>
  )
}

function ProviderCard({ name, location, rating, reviews, verified, status }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
          <Store className="w-6 h-6" />
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {status}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-gray-900">{name}</h3>
          {verified ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-orange-400" />}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3" />
          {location}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-50">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-bold text-gray-900">{rating}</span>
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>
        <button className="ml-auto text-sm font-semibold text-indigo-600 hover:text-indigo-500">Manage</button>
      </div>
    </div>
  )
}

function Store(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 10V7" />
    </svg>
  )
}
