"use client"

import { useState } from "react"
import { Search, Filter, SlidersHorizontal } from "lucide-react"
import { useProviders } from "@/hooks/useProviders"
import { ProviderCard } from "@/components/customer/ProviderCard"
import { Skeleton } from "@/components/ui/LoadingSkeleton"
import { DEVICE_TYPES } from "@/types"

export default function ProvidersPage() {
  const [city, setCity] = useState("")
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number>(0)
  const [sort, setSort] = useState<"rating" | "reviews" | "name">("rating")

  const { data, isLoading, isError } = useProviders({
    city,
    device_type: selectedDevices,
    min_rating: minRating,
    sort,
  })

  const toggleDevice = (device: string) => {
    setSelectedDevices((prev) =>
      prev.includes(device)
        ? prev.filter((d) => d !== device)
        : [...prev, device]
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Repair Providers</h1>
          <p className="text-gray-600 mt-1">Browse and filter verified repair shops near you.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
            <div className="flex items-center space-x-2 font-semibold text-gray-900 pb-4 border-b border-gray-100">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              <span>Filters</span>
            </div>

            {/* City Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Device Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Categories
              </label>
              <div className="space-y-2">
                {DEVICE_TYPES.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDevices.includes(type)}
                      onChange={() => toggleDevice(type)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border p-5 space-y-4">
                  <div className="flex space-x-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between pt-4 border-t border-gray-50">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
              <p className="text-red-600">Failed to load providers. Please try again.</p>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.data.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
              <div className="flex justify-center mb-4">
                <Search className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No providers found</h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your filters to find more results.
              </p>
              <button
                onClick={() => {
                  setCity("")
                  setSelectedDevices([])
                  setMinRating(0)
                }}
                className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
