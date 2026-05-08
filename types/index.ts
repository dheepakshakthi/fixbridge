/**
 * FixBridge — public type surface.
 *
 * Import from here instead of from `./database` directly so you always get
 * the ergonomic shorthand names rather than the verbose Supabase path syntax.
 */

import type { Database } from "./database";

// =========================================================================
//  Table Row types  (what you get back from SELECT queries)
// =========================================================================

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ServiceProvider =
  Database["public"]["Tables"]["service_providers"]["Row"];
export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
export type Delivery = Database["public"]["Tables"]["deliveries"]["Row"];
export type TicketEvent = Database["public"]["Tables"]["ticket_events"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

// =========================================================================
//  Insert types  (what you pass to INSERT / upsert calls)
// =========================================================================

export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ServiceProviderInsert =
  Database["public"]["Tables"]["service_providers"]["Insert"];
export type TicketInsert = Database["public"]["Tables"]["tickets"]["Insert"];
export type QuoteInsert = Database["public"]["Tables"]["quotes"]["Insert"];
export type DeliveryInsert =
  Database["public"]["Tables"]["deliveries"]["Insert"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];

// =========================================================================
//  Update types  (what you pass to UPDATE calls — all fields optional)
// =========================================================================

export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ServiceProviderUpdate =
  Database["public"]["Tables"]["service_providers"]["Update"];
export type TicketUpdate = Database["public"]["Tables"]["tickets"]["Update"];
export type QuoteUpdate = Database["public"]["Tables"]["quotes"]["Update"];
export type DeliveryUpdate =
  Database["public"]["Tables"]["deliveries"]["Update"];
export type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];
export type NotificationUpdate =
  Database["public"]["Tables"]["notifications"]["Update"];

// =========================================================================
//  Enum types  (shorthand aliases for the DB enum unions)
// =========================================================================

export type TicketStatus = Database["public"]["Enums"]["ticket_status"];
export type ServiceMode = Database["public"]["Enums"]["service_mode"];
export type UrgencyLevel = Database["public"]["Enums"]["urgency_level"];
export type DeliveryStatus = Database["public"]["Enums"]["delivery_status"];
export type QuoteStatus = Database["public"]["Enums"]["quote_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];

// =========================================================================
//  Shared JSON sub-types  (mirrored from the DB column shapes)
// =========================================================================

/** One cost line inside a quote. */
export type QuoteLineItem = {
  label: string;
  amount: number;
};

/** Operating schedule for one day of the week. */
export type DayHours = {
  is_open: boolean;
  open_time: string; // "HH:MM" 24-hour format
  close_time: string; // "HH:MM" 24-hour format
};

/** Full weekly schedule stored on a ServiceProvider row. */
export type WorkingHours = {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
};

/**
 * Customer's address stored on a ticket.
 * Includes state because this is used for both pickup and correspondence.
 */
export type CustomerAddress = {
  street: string;
  city: string;
  state: string;
  pincode: string;
};

/**
 * Delivery leg address (pickup_address / delivery_address columns).
 * No state field — pincode is sufficient for logistics partners.
 */
export type DeliveryAddress = {
  street: string;
  city: string;
  pincode: string;
};

// =========================================================================
//  Composite / joined types  (shapes returned from joined queries)
// =========================================================================

/**
 * A ticket enriched with its most commonly needed related rows.
 * All relations are optional because they are only present when joined.
 */
export type TicketWithDetails = Ticket & {
  /** The assigned service provider, if one has been matched. */
  provider?: ServiceProvider | null;
  /** The most recent (or active) quote for this ticket. */
  quote?: Quote | null;
  /** Active delivery leg for this ticket. */
  delivery?: Delivery | null;
  /** Full audit trail of status transitions. */
  events?: TicketEvent[];
  /** Slim customer profile — id/name/avatar/phone only. */
  customer?: Pick<Profile, "id" | "full_name" | "avatar_url" | "phone">;
};

/**
 * A service provider enriched with profile and review data.
 *
 * NOTE: `email` is intentionally excluded from `profile` here — it lives in
 * `auth.users`, not in the `profiles` table. Join via Supabase Admin SDK or
 * a server-side RPC if you need the provider's email address.
 */
export type ProviderWithStats = ServiceProvider & {
  profile?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  reviews?: Review[];
};

/** A notification row with an optional slim ticket snapshot attached. */
export type NotificationWithTicket = Notification & {
  ticket?: Pick<
    Ticket,
    "id" | "ticket_number" | "device_type" | "status"
  > | null;
};

// =========================================================================
//  Domain input types  (DTOs for mutations)
// =========================================================================

/**
 * Input for creating a new ticket.
 * Includes customer_id at the top level (normally from auth context).
 */
export type CreateTicketInput = {
  customer_id: string;
  device_type: string;
  brand?: string | null;
  model?: string | null;
  issue_description: string;
  issue_images?: string[] | null;
  service_mode: ServiceMode;
  urgency?: UrgencyLevel;
  customer_address?: CustomerAddress | null;
  preferred_date?: string | null;
  provider_id?: string | null;
};

// =========================================================================
//  Domain constants
// =========================================================================

/** Canonical list of device categories the platform supports. */
export const DEVICE_TYPES = ["PC", "Laptop", "Console", "Mobile"] as const;
export type DeviceType = (typeof DEVICE_TYPES)[number];

// =========================================================================
//  Status display maps
// =========================================================================

/** Human-readable label for every ticket status value. */
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  quoted: "Quote Received",
  accepted: "Accepted",
  in_repair: "In Repair",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

/**
 * Tailwind CSS badge classes for every ticket status.
 * Apply as `className={TICKET_STATUS_COLORS[ticket.status]}`.
 */
export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  quoted: "bg-yellow-100 text-yellow-700",
  accepted: "bg-indigo-100 text-indigo-700",
  in_repair: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  disputed: "bg-rose-100 text-rose-700",
};

/** Human-readable label for every delivery status value. */
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  scheduled: "Scheduled",
  pickup_assigned: "Pickup Assigned",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
};

/**
 * Tailwind CSS badge classes for every delivery status.
 * Apply as `className={DELIVERY_STATUS_COLORS[delivery.status]}`.
 */
export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  scheduled: "bg-gray-100 text-gray-700",
  pickup_assigned: "bg-blue-100 text-blue-700",
  picked_up: "bg-indigo-100 text-indigo-700",
  in_transit: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
};

/** Human-readable label for every quote status value. */
export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Expired",
};

/**
 * Tailwind CSS badge classes for every quote status.
 * Apply as `className={QUOTE_STATUS_COLORS[quote.status]}`.
 */
export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
};

// Re-export the raw Database type for library-level consumers (e.g. the
// Supabase client initialisation file) that need the full generic shape.
export type { Database } from "./database";
