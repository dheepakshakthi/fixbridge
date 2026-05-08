// Database types generated from Supabase schema
// See plan.md SECTION 2 for the complete schema documentation

// JSON schema types for complex columns
type WorkingHoursJson = {
  [day: string]: {
    is_open: boolean;
    open_time?: string;
    close_time?: string;
  };
};

type LineItemJson = {
  [key: string]: string | number | boolean | null;
};

type AddressJson = {
  street: string;
  city: string;
  state?: string;
  pincode: string;
  [key: string]: string | undefined;
};

type EventMetadataJson = {
  [key: string]: string | number | boolean | null | object;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "customer" | "provider" | "admin" | "super_admin";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "provider" | "admin" | "super_admin";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "provider" | "admin" | "super_admin";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      service_providers: {
        Row: {
          id: string;
          profile_id: string;
          shop_name: string;
          description: string | null;
          logo_url: string | null;
          device_categories: string[] | null;
          services_offered: string[] | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          latitude: number | null;
          longitude: number | null;
          is_verified: boolean;
          is_active: boolean;
          avg_rating: number;
          total_reviews: number;
          working_hours: WorkingHoursJson | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          shop_name: string;
          description?: string | null;
          logo_url?: string | null;
          device_categories?: string[] | null;
          services_offered?: string[] | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_verified?: boolean;
          is_active?: boolean;
          avg_rating?: number;
          total_reviews?: number;
          working_hours?: WorkingHoursJson | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          shop_name?: string;
          description?: string | null;
          logo_url?: string | null;
          device_categories?: string[] | null;
          services_offered?: string[] | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_verified?: boolean;
          is_active?: boolean;
          avg_rating?: number;
          total_reviews?: number;
          working_hours?: WorkingHoursJson | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_providers_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      tickets: {
        Row: {
          id: string;
          ticket_number: string;
          customer_id: string;
          provider_id: string | null;
          device_type: string;
          brand: string | null;
          model: string | null;
          issue_description: string;
          issue_images: string[] | null;
          status:
            | "draft"
            | "submitted"
            | "quoted"
            | "accepted"
            | "in_repair"
            | "ready"
            | "completed"
            | "cancelled"
            | "disputed";
          service_mode: "dropoff" | "pickup" | "delivery";
          urgency: "urgent" | "standard" | "flexible";
          customer_address: AddressJson | null;
          preferred_date: string | null;
          completion_report: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_number?: string;
          customer_id: string;
          provider_id?: string | null;
          device_type: string;
          brand?: string | null;
          model?: string | null;
          issue_description: string;
          issue_images?: string[] | null;
          status?:
            | "draft"
            | "submitted"
            | "quoted"
            | "accepted"
            | "in_repair"
            | "ready"
            | "completed"
            | "cancelled"
            | "disputed";
          service_mode: "dropoff" | "pickup" | "delivery";
          urgency?: "urgent" | "standard" | "flexible";
          customer_address?: AddressJson | null;
          preferred_date?: string | null;
          completion_report?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_number?: string;
          customer_id?: string;
          provider_id?: string | null;
          device_type?: string;
          brand?: string | null;
          model?: string | null;
          issue_description?: string;
          issue_images?: string[] | null;
          status?:
            | "draft"
            | "submitted"
            | "quoted"
            | "accepted"
            | "in_repair"
            | "ready"
            | "completed"
            | "cancelled"
            | "disputed";
          service_mode?: "dropoff" | "pickup" | "delivery";
          urgency?: "urgent" | "standard" | "flexible";
          customer_address?: AddressJson | null;
          preferred_date?: string | null;
          completion_report?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tickets_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tickets_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "service_providers";
            referencedColumns: ["id"];
          },
        ];
      };

      quotes: {
        Row: {
          id: string;
          ticket_id: string;
          provider_id: string;
          amount: number;
          currency: string;
          line_items: LineItemJson[] | null;
          estimated_days: number | null;
          notes: string | null;
          status: "pending" | "approved" | "rejected" | "expired";
          valid_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          provider_id: string;
          amount: number;
          currency?: string;
          line_items?: LineItemJson[] | null;
          estimated_days?: number | null;
          notes?: string | null;
          status?: "pending" | "approved" | "rejected" | "expired";
          valid_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          provider_id?: string;
          amount?: number;
          currency?: string;
          line_items?: LineItemJson[] | null;
          estimated_days?: number | null;
          notes?: string | null;
          status?: "pending" | "approved" | "rejected" | "expired";
          valid_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotes_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "service_providers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
        ];
      };

      deliveries: {
        Row: {
          id: string;
          ticket_id: string;
          tracking_code: string;
          direction: string;
          status:
            | "scheduled"
            | "pickup_assigned"
            | "picked_up"
            | "in_transit"
            | "delivered";
          pickup_address: AddressJson | null;
          delivery_address: AddressJson | null;
          agent_name: string | null;
          estimated_delivery: string | null;
          scheduled_at: string | null;
          picked_up_at: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          tracking_code: string;
          direction: string;
          status?:
            | "scheduled"
            | "pickup_assigned"
            | "picked_up"
            | "in_transit"
            | "delivered";
          pickup_address?: AddressJson | null;
          delivery_address?: AddressJson | null;
          agent_name?: string | null;
          estimated_delivery?: string | null;
          scheduled_at?: string | null;
          picked_up_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          tracking_code?: string;
          direction?: string;
          status?:
            | "scheduled"
            | "pickup_assigned"
            | "picked_up"
            | "in_transit"
            | "delivered";
          pickup_address?: AddressJson | null;
          delivery_address?: AddressJson | null;
          agent_name?: string | null;
          estimated_delivery?: string | null;
          scheduled_at?: string | null;
          picked_up_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deliveries_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
        ];
      };

      ticket_events: {
        Row: {
          id: string;
          ticket_id: string;
          actor_id: string;
          event_type: string;
          from_status:
            | "draft"
            | "submitted"
            | "quoted"
            | "accepted"
            | "in_repair"
            | "ready"
            | "completed"
            | "cancelled"
            | "disputed"
            | null;
          to_status:
            | "draft"
            | "submitted"
            | "quoted"
            | "accepted"
            | "in_repair"
            | "ready"
            | "completed"
            | "cancelled"
            | "disputed"
            | null;
          metadata: EventMetadataJson | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          actor_id: string;
          event_type: string;
          from_status?:
            | "draft"
            | "submitted"
            | "quoted"
            | "accepted"
            | "in_repair"
            | "ready"
            | "completed"
            | "cancelled"
            | "disputed"
            | null;
          to_status?:
            | "draft"
            | "submitted"
            | "quoted"
            | "accepted"
            | "in_repair"
            | "ready"
            | "completed"
            | "cancelled"
            | "disputed"
            | null;
          metadata?: EventMetadataJson | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          actor_id?: string;
          event_type?: string;
          from_status?:
            | "draft"
            | "submitted"
            | "quoted"
            | "accepted"
            | "in_repair"
            | "ready"
            | "completed"
            | "cancelled"
            | "disputed"
            | null;
          to_status?:
            | "draft"
            | "submitted"
            | "quoted"
            | "accepted"
            | "in_repair"
            | "ready"
            | "completed"
            | "cancelled"
            | "disputed"
            | null;
          metadata?: EventMetadataJson | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_events_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ticket_events_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
        ];
      };

      reviews: {
        Row: {
          id: string;
          ticket_id: string;
          customer_id: string;
          provider_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          customer_id: string;
          provider_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          customer_id?: string;
          provider_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "service_providers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
        ];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          action_url: string | null;
          ticket_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          action_url?: string | null;
          ticket_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          action_url?: string | null;
          ticket_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      ticket_status:
        | "draft"
        | "submitted"
        | "quoted"
        | "accepted"
        | "in_repair"
        | "ready"
        | "completed"
        | "cancelled"
        | "disputed";
      service_mode: "dropoff" | "pickup" | "delivery";
      urgency_level: "urgent" | "standard" | "flexible";
      delivery_status:
        | "scheduled"
        | "pickup_assigned"
        | "picked_up"
        | "in_transit"
        | "delivered";
      quote_status: "pending" | "approved" | "rejected" | "expired";
      user_role: "customer" | "provider" | "admin" | "super_admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
