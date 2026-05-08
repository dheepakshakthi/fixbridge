import Link from "next/link";
import { Star, MapPin, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceProvider } from "@/types";

interface ProviderCardProps {
  provider: ServiceProvider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            {provider.logo_url ? (
              <img
                src={provider.logo_url}
                alt={provider.shop_name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-indigo-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 leading-tight">
                {provider.shop_name}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {provider.city}, {provider.state}
              </div>
            </div>
          </div>
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-sm font-medium">
            <Star className="w-3.5 h-3.5 mr-1 fill-yellow-400 text-yellow-400" />
            {provider.avg_rating.toFixed(1)}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {provider.device_categories?.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium"
              >
                {cat}
              </span>
            ))}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {provider.description || "No description provided."}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            {provider.total_reviews} reviews
          </span>
          <Link href={`/customer/providers/${provider.id}`}>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View Profile &rarr;
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
