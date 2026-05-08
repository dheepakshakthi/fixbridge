"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCreateTicket } from "@/hooks/useTickets";
import { useProviders } from "@/hooks/useProviders";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Button } from "@/components/ui/Button";
import {
  ticketStep1Schema,
  ticketStep2Schema,
  ticketStep3Schema,
  ticketStep4Schema,
} from "@/schemas/ticket";
import type {
  TicketStep1,
  TicketStep2,
  TicketStep3,
  TicketStep4,
} from "@/schemas/ticket";
import {
  Monitor,
  Laptop,
  Gamepad2,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { CreateTicketInput } from "@/types";

const STEPS = ["Device", "Issue", "Preferences", "Provider", "Review"];

const deviceIcons = {
  PC: Monitor,
  Laptop: Laptop,
  Console: Gamepad2,
  Mobile: Smartphone,
} as const;

export default function NewTicket() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<
    Partial<TicketStep1 & TicketStep2 & TicketStep3 & TicketStep4>
  >({});
  const [images, setImages] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const createTicket = useCreateTicket();
  const supabase = createClient();

  // Get current user on mount
  useState(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  });

  const step1Form = useForm<TicketStep1>({
    resolver: zodResolver(ticketStep1Schema),
    defaultValues: formData,
  });
  const step2Form = useForm<TicketStep2>({
    resolver: zodResolver(ticketStep2Schema),
    defaultValues: formData,
  });
  const step3Form = useForm<TicketStep3>({
    resolver: zodResolver(ticketStep3Schema),
    defaultValues: { urgency: "standard", ...formData },
  });
  const step4Form = useForm<TicketStep4>({
    resolver: zodResolver(ticketStep4Schema),
    defaultValues: formData,
  });

  const nextStep = async () => {
    let valid = false;
    let data = {};

    if (step === 0) {
      valid = await step1Form.trigger();
      data = step1Form.getValues();
    }
    if (step === 1) {
      valid = await step2Form.trigger();
      data = step2Form.getValues();
    }
    if (step === 2) {
      valid = await step3Form.trigger();
      data = step3Form.getValues();
    }
    if (step === 3) {
      valid = true;
      data = step4Form.getValues();
    }
    if (step === 4) {
      await handleSubmit();
      return;
    }

    if (valid) {
      setFormData((prev) => ({ ...prev, ...data }));
      setStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return toast.error("Please log in to submit a request");

    try {
      await createTicket.mutateAsync(
        {
          ...(formData as Omit<CreateTicketInput, "issue_images">),
          issue_images: images,
          customer_id: userId,
        },
        {
          onSuccess: (ticket) => {
            router.push(`/customer/tickets/${ticket.id}`);
          },
        },
      );
    } catch (err) {
      console.error("HandleSubmit Error:", err);
    }
  };

  const { data: providers } = useProviders(
    step === 3
      ? { device_type: formData.device_type ? [formData.device_type] : [] }
      : undefined,
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        New Repair Request
      </h1>

      {/* Step Progress */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                i < step
                  ? "bg-indigo-600 text-white"
                  : i === step
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`ml-2 text-sm hidden sm:block ${
                i === step ? "text-indigo-600 font-medium" : "text-gray-400"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-indigo-600" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Step 0: Device */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              What device needs repair?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(["PC", "Laptop", "Console", "Mobile"] as const).map((type) => {
                const Icon = deviceIcons[type];
                const selected = step1Form.watch("device_type") === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      step1Form.setValue("device_type", type, {
                        shouldValidate: true,
                      })
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                      selected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      className={`h-8 w-8 ${selected ? "text-indigo-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm font-medium ${selected ? "text-indigo-700" : "text-gray-600"}`}
                    >
                      {type}
                    </span>
                  </button>
                );
              })}
            </div>
            {step1Form.formState.errors.device_type && (
              <p className="text-red-500 text-sm">
                {step1Form.formState.errors.device_type.message}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  {...step1Form.register("brand")}
                  placeholder="e.g. Dell, Apple"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  {...step1Form.register("model")}
                  placeholder="e.g. XPS 15, iPhone 14"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Issue */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Describe the issue
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Description *
              </label>
              <textarea
                {...step2Form.register("issue_description")}
                rows={5}
                placeholder="Describe what's wrong in detail. The more information you provide, the better the quote you'll receive."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              {step2Form.formState.errors.issue_description && (
                <p className="text-red-500 text-sm mt-1">
                  {step2Form.formState.errors.issue_description.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {(step2Form.watch("issue_description") ?? "").length}/1000
                characters
              </p>
            </div>
            {userId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos{" "}
                  <span className="text-gray-400">(optional, max 5)</span>
                </label>
                <ImageUploader
                  value={images}
                  onChange={setImages}
                  userId={userId}
                  maxImages={5}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Service preferences
            </h2>

            {/* Service Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Mode *
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: "dropoff",
                    label: "Drop off at shop",
                    desc: "You bring the device to the repair shop",
                  },
                  {
                    value: "pickup",
                    label: "Request pickup",
                    desc: "We arrange a courier to pick up from you",
                  },
                  {
                    value: "delivery",
                    label: "Delivery both ways",
                    desc: "Pickup and return delivery included",
                  },
                ].map((mode) => (
                  <label
                    key={mode.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      step3Form.watch("service_mode") === mode.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      {...step3Form.register("service_mode")}
                      value={mode.value}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {mode.label}
                      </p>
                      <p className="text-xs text-gray-500">{mode.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {step3Form.formState.errors.service_mode && (
                <p className="text-red-500 text-sm mt-1">
                  {step3Form.formState.errors.service_mode.message}
                </p>
              )}
            </div>

            {/* Address (only for pickup/delivery) */}
            {(step3Form.watch("service_mode") === "pickup" ||
              step3Form.watch("service_mode") === "delivery") && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700">
                  Your Address
                </h3>
                {(["street", "city", "state", "pincode"] as const).map(
                  (field) => (
                    <div key={field}>
                      <input
                        {...step3Form.register(`customer_address.${field}`)}
                        placeholder={
                          field.charAt(0).toUpperCase() + field.slice(1)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {step3Form.formState.errors.customer_address?.[field] && (
                        <p className="text-red-500 text-xs mt-1">
                          {
                            step3Form.formState.errors.customer_address[field]
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: "urgent",
                    label: "Urgent",
                    desc: "ASAP",
                    color: "text-red-600 border-red-200 bg-red-50",
                  },
                  {
                    value: "standard",
                    label: "Standard",
                    desc: "Within a week",
                    color: "text-blue-600 border-blue-200 bg-blue-50",
                  },
                  {
                    value: "flexible",
                    label: "Flexible",
                    desc: "No rush",
                    color: "text-green-600 border-green-200 bg-green-50",
                  },
                ].map((u) => (
                  <label
                    key={u.value}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      step3Form.watch("urgency") === u.value
                        ? u.color
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      {...step3Form.register("urgency")}
                      value={u.value}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">{u.label}</span>
                    <span className="text-xs text-gray-500">{u.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="date"
                {...step3Form.register("preferred_date")}
                min={new Date().toISOString().split("T")[0]}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 3: Provider */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Choose a provider{" "}
              <span className="text-gray-400 font-normal text-base">
                (optional)
              </span>
            </h2>
            <p className="text-sm text-gray-500">
              Select a provider now, or skip and let multiple shops bid for your
              request.
            </p>

            {providers?.data.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No verified providers available for this device type yet. Your
                request will be broadcast to all matching shops.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {providers?.data.map((p) => {
                  const selected = step4Form.watch("provider_id") === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        step4Form.setValue(
                          "provider_id",
                          selected ? undefined : p.id,
                        )
                      }
                      className={`text-left p-4 rounded-xl border-2 transition-colors ${
                        selected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{p.shop_name}</p>
                      <p className="text-xs text-gray-500">{p.city}</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        ★ {p.avg_rating?.toFixed(1)} ({p.total_reviews} reviews)
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Review your request
            </h2>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 flex justify-between text-sm">
                <span className="text-gray-500">Device</span>
                <span className="font-medium">
                  {formData.device_type} {formData.brand} {formData.model}
                </span>
              </div>
              <div className="px-4 py-3 flex justify-between text-sm">
                <span className="text-gray-500">Service Mode</span>
                <span className="font-medium capitalize">
                  {formData.service_mode}
                </span>
              </div>
              <div className="px-4 py-3 bg-gray-50 flex justify-between text-sm">
                <span className="text-gray-500">Urgency</span>
                <span className="font-medium capitalize">
                  {formData.urgency}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-500 mb-1">Issue Description</p>
                <p className="text-sm">{formData.issue_description}</p>
              </div>
              {images.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 flex justify-between text-sm">
                  <span className="text-gray-500">Images</span>
                  <span className="font-medium">{images.length} photo(s)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button onClick={nextStep} loading={createTicket.isPending}>
            {step === STEPS.length - 1 ? "Submit Request" : "Next"}
            {step < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
