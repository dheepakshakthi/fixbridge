"use client";

import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, Clock, Phone, ChevronLeft, Wrench } from "lucide-react";
import { useProviderProfile } from "@/hooks/useProviders";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import Link from "next/link";

export default function ProviderProfilePage() {
  const { providerId } = useParams();
  const router = useRouter();
  const {
    data: provider,
    isLoading,
    isError,
  } = useProviderProfile(providerId as string);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-6 w-24" />
        <div className="bg-white rounded-2xl border p-8 space-y-6">
          <div className="flex space-x-6">
            <Skeleton className="w-24 h-24 rounded-xl" />
            <div className="space-y-4 flex-1">
              <Skeleton className="h-8 w-64" />
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Provider not found</h2>
        <p className="text-gray-600 mt-2">
          The provider you are looking for does not exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to search
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
            <div className="mb-6 md:mb-0">
              {provider.logo_url ? (
                <img
                  src={provider.logo_url}
                  alt={provider.shop_name}
                  className="w-32 h-32 rounded-2xl object-cover border border-gray-100"
                />
              ) : (
                <div className="w-32 h-32 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <Wrench className="w-12 h-12 text-indigo-600" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {provider.shop_name}
                  </h1>
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                    {provider.city}, {provider.state} {provider.pincode}
                  </div>
                </div>
                <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-xl text-yellow-700 border border-yellow-100">
                  <Star className="w-5 h-5 mr-1.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold">
                    {provider.avg_rating.toFixed(1)}
                  </span>
                  <span className="text-sm ml-1 text-yellow-600">
                    ({provider.total_reviews} reviews)
                  </span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {provider.description ||
                  "Expert repair services for all your devices."}
              </p>

              <div className="flex flex-wrap gap-2">
                {provider.device_categories?.map((cat: string) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 flex flex-wrap gap-6 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>Open today: 9:00 AM - 6:00 PM</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span>Verified Provider</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Services Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Services Offered
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provider.services_offered?.map((service: string) => (
                <div key={service} className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                  {service}
                </div>
              )) || (
                <p className="text-gray-500 italic">
                  No specific services listed.
                </p>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Customer Reviews
            </h2>
            <div className="space-y-8">
              {provider.reviews && provider.reviews.length > 0 ? (
                provider.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 pb-8 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                          {review.profiles?.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {review.profiles?.full_name || "Anonymous User"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No reviews yet for this provider.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: CTA */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-lg shadow-indigo-200 sticky top-8">
            <h3 className="text-xl font-bold mb-4">Need a repair?</h3>
            <p className="text-indigo-100 mb-8 leading-relaxed">
              Book a repair request with {provider.shop_name} today. Most
              repairs are completed within 48 hours.
            </p>
            <Link href={`/customer/tickets/new?providerId=${provider.id}`}>
              <Button
                variant="secondary"
                className="w-full py-4 text-indigo-600 bg-white hover:bg-indigo-50 border-0 font-bold text-lg"
              >
                Book Repair Now
              </Button>
            </Link>
            <p className="text-center text-xs text-indigo-200 mt-4">
              Free diagnostics on all devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
