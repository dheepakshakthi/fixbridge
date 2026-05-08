"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Filter,
  ArrowRight,
  Monitor,
  Laptop,
  Gamepad2,
  Smartphone,
} from "lucide-react";
import { useNewRequests } from "@/hooks/useProviderJobs";
import { useMyProviderProfile } from "@/hooks/useProviders";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const deviceIcons = {
  PC: Monitor,
  Laptop: Laptop,
  Console: Gamepad2,
  Mobile: Smartphone,
} as const;

export default function NewJobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: profile, isLoading: profileLoading } = useMyProviderProfile();
  const { data: requests, isLoading: requestsLoading } = useNewRequests(
    profile?.id,
    profile?.device_categories,
  );

  const isLoading = profileLoading || requestsLoading;

  const filteredRequests = requests?.filter((req) => {
    const searchStr =
      `${req.device_type} ${req.brand} ${req.model} ${req.issue_description}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Repair Requests
          </h1>
          <p className="text-gray-500 text-sm">
            Browse requests from customers and submit your quotes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : filteredRequests && filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((request) => (
            <JobCard
              key={request.id}
              id={request.id}
              device_type={request.device_type}
              brand={request.brand}
              model={request.model}
              issue={request.issue_description}
              customer={request.profiles?.full_name || "Anonymous"}
              address={request.customer_address}
              urgency={request.urgency}
              date={request.created_at}
              isTargeted={request.provider_id === profile?.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No new requests"
          description={
            searchTerm
              ? "No requests match your search criteria."
              : "Check back later for new repair requests in your categories."
          }
        />
      )}
    </div>
  );
}

function JobCard({
  id,
  device_type,
  brand,
  model,
  issue,
  customer,
  address,
  urgency,
  date,
  isTargeted,
}: any) {
  const Icon =
    deviceIcons[device_type as keyof typeof deviceIcons] || ClipboardList;
  const location = address
    ? `${address.city || ""}${address.city && address.state ? ", " : ""}${address.state || ""}`
    : "Remote/Not specified";

  return (
    <div
      className={`bg-white border rounded-xl p-6 transition-all ${
        isTargeted
          ? "border-indigo-200 ring-1 ring-indigo-50 shadow-sm"
          : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isTargeted
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">
                {device_type} {brand} {model}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  urgency === "urgent"
                    ? "bg-red-100 text-red-700"
                    : urgency === "standard"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {urgency}
              </span>
              {isTargeted && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">
                  Direct Request
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {customer} • {location}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </p>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-6">{issue}</p>

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
  );
}
