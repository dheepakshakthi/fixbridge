import { User, Store, MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react"

export default function ProviderProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Profile</h1>
          <p className="text-gray-500 text-sm">Manage your shop information and public presence.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-100">
              <Store className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">TechFix Solutions</h2>
            <div className="flex items-center justify-center gap-1 mt-1 text-green-600">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Shop</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                shop@techfix.com
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                Andheri East, Mumbai
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">About Your Shop</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Expert repair centre specialising in laptops, PCs, consoles and mobile devices.
                All repairs carry a 90-day warranty. We use only genuine parts and offer same-day service for minor repairs.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Device Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['Laptop', 'PC', 'Console', 'Mobile'].map(cat => (
                  <span key={cat} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Working Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{day}</span>
                    <span className="text-gray-900 font-medium">09:00 - 19:00</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Saturday</span>
                  <span className="text-gray-900 font-medium">10:00 - 17:00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sunday</span>
                  <span className="text-red-500 font-medium uppercase text-xs">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
