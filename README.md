# FixBridge — Device Repair Marketplace

A full-stack two-sided marketplace connecting device owners with verified repair shops for PCs, laptops, gaming consoles, and mobile phones.

## 🎯 Project Overview

FixBridge is built with:
- **Framework**: Next.js 14 (App Router)
- **Database & Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **UI**: React 18 + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Type Safety**: TypeScript throughout

## 🏗️ Project Structure

```
fixbridge/
├── app/                          # Next.js App Router
│   ├── (customer)/              # Customer portal (authenticated)
│   │   ├── customer/
│   │   │   ├── dashboard/       # Customer dashboard
│   │   │   ├── tickets/         # Ticket management
│   │   │   │   ├── new/        # Multi-step ticket creation
│   │   │   │   └── [ticketId]/ # Ticket detail
│   │   │   ├── providers/       # Provider discovery
│   │   │   ├── notifications/   # Notification inbox
│   │   │   └── track/          # Delivery tracker
│   │   └── layout.tsx          # Customer layout with nav
│   ├── (provider)/              # Provider portal (authenticated)
│   │   ├── provider/
│   │   │   ├── dashboard/       # Provider dashboard
│   │   │   ├── jobs/
│   │   │   │   ├── new/        # New job requests
│   │   │   │   ├── active/     # Active jobs + quote management
│   │   │   │   ├── completed/  # Completed jobs + reviews
│   │   │   │   └── delivery/   # Delivery management
│   │   │   └── profile/        # Shop profile settings
│   │   └── layout.tsx          # Provider layout with sidebar
│   ├── (admin)/                 # Admin panel (authenticated)
│   │   ├── admin/
│   │   │   ├── dashboard/       # Platform metrics
│   │   │   ├── providers/       # Provider verification & management
│   │   │   ├── tickets/         # All tickets oversight
│   │   │   ├── disputes/        # Dispute resolution
│   │   │   ├── users/           # User management
│   │   │   ├── admins/          # Admin management (super_admin only)
│   │   │   └── audit/           # Audit log viewer
│   │   └── layout.tsx          # Admin layout with sidebar
│   ├── login/                   # Login page
│   ├── register/                # Registration (customer/provider)
│   ├── unauthorised/            # Access denied page
│   ├── track/[trackingCode]/    # Public delivery tracker
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing/marketing page
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── TicketCard.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   └── ImageUploader.tsx
│   ├── shared/                  # Shared business components
│   │   └── NotificationBell.tsx
│   ├── customer/                # Customer-specific components
│   ├── provider/                # Provider-specific components
│   ├── admin/                   # Admin-specific components
│   └── providers/               # React providers
│       └── QueryProvider.tsx
├── hooks/                       # React Query hooks (data layer)
│   ├── useTickets.ts           # Customer ticket operations
│   ├── useProviderJobs.ts      # Provider job operations
│   ├── useDelivery.ts          # Delivery tracking
│   ├── useProviders.ts         # Provider discovery
│   ├── useNotifications.ts     # Notification management
│   └── useAdmin.ts             # Admin operations
├── schemas/                     # Zod validation schemas
│   ├── ticket.ts
│   ├── quote.ts
│   ├── provider.ts
│   ├── review.ts
│   ├── dispute.ts
│   ├── profile.ts
│   ├── admin.ts
│   └── auth.ts
├── types/                       # TypeScript definitions
│   ├── database.ts             # Supabase generated types
│   └── index.ts                # Helper types & constants
├── utils/
│   └── supabase/               # Supabase client utilities
│       ├── server.ts           # Server Component client
│       ├── client.ts           # Client Component client
│       └── middleware.ts       # Middleware client
├── lib/
│   └── utils.ts                # Utility functions (cn, formatters, etc.)
├── supabase/
│   ├── migrations/             # Database migrations
│   │   └── 001_initial_schema.sql
│   ├── seed.sql                # Test data seeding
│   ├── functions/              # Edge Functions
│   │   ├── notify/             # Notification system
│   │   ├── advance-delivery/   # Mock delivery progression
│   │   ├── generate-tracking-code/
│   │   └── verify-provider/
│   └── config.toml             # Supabase configuration
├── middleware.ts                # Next.js middleware (auth & role guards)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                   # Environment variables (gitignored)
├── .env.local.example          # Environment template
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- (Optional) Supabase CLI for local development

### Installation

1. **Clone and install dependencies**:
```bash
cd D:\NetradiX_Services\fixbridge
npm install
```

2. **Configure environment variables**:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://eufywqjqmiuqepljshtd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up the database**:

Run the migration file in Supabase SQL Editor:
```bash
# Copy contents of supabase/migrations/001_initial_schema.sql
# Paste into Supabase Dashboard > SQL Editor > Run
```

Optionally seed test data:
```bash
# Copy contents of supabase/seed.sql and run in SQL Editor
```

4. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📊 Database Schema

### Core Tables

- **profiles** — User profiles (extends auth.users)
- **service_providers** — Repair shop profiles
- **tickets** — Repair requests (core entity)
- **quotes** — Cost estimates from providers
- **deliveries** — Mock delivery tracking
- **ticket_events** — Immutable audit log
- **reviews** — Post-completion ratings
- **notifications** — In-app notifications

### Row Level Security (RLS)

All tables use RLS policies enforcing:
- Customers can only see their own tickets
- Providers see only assigned tickets
- Admins have full read access
- Service role bypasses RLS for Edge Functions

### Custom JWT Claims

A Postgres function injects the user's role (`customer`, `provider`, `admin`, `super_admin`) into the JWT as `user_role`, used by all RLS policies.

## 🎨 User Roles & Portals

### Customer Portal (`/customer/*`)
- Create repair requests (multi-step form with image upload)
- View and filter own tickets
- Discover and browse providers
- Approve/reject quotes
- Track deliveries in real-time
- Leave reviews after completion

### Provider Portal (`/provider/*`)
- Dashboard with metrics
- Browse and accept new requests
- Manage active jobs (submit quotes, update status)
- View completed jobs and reviews
- Initiate return deliveries
- Manage shop profile (logo, hours, services, devices)

### Admin Panel (`/admin/*`)
- Platform-wide metrics and analytics
- Verify new providers
- Manage all providers (suspend/reactivate)
- Oversee all tickets
- Resolve disputes
- User management
- Audit log viewer
- (Super admin only) Manage admins

## 🔐 Authentication & Authorization

### Middleware
`middleware.ts` handles:
- Session refresh on every request
- Route guards based on authentication state
- Role-based access control (RBAC)
- Redirect logic (authenticated users away from login, etc.)

### Role Guards
- `/customer/*` → any authenticated user (default role)
- `/provider/*` → `provider`, `admin`, or `super_admin`
- `/admin/*` → `admin` or `super_admin`

## 🔔 Realtime Features

Built with Supabase Realtime:
- **Notification bell** — Live unread count updates
- **Delivery tracker** — Live status progression
- **Provider queue** — New requests appear instantly
- **Ticket updates** — Status changes update live for both customer and provider

## 🧪 Testing

### Unit Tests (Vitest + React Testing Library)
```bash
npm run test
```

Test coverage includes:
- All Zod validation schemas
- JWT role extraction
- Ticket number generation
- Form validation edge cases

### Integration Tests
Test key flows:
- Ticket creation end-to-end
- Status transitions (valid/invalid)
- RLS policy enforcement

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

Test user journeys:
- Customer: register → create ticket → see in list
- Provider: login → accept ticket → submit quote
- Admin: verify provider
- Public delivery tracker (no login required)

## 📦 Deployment

### Vercel (Frontend)

1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase (Backend)

Already live at `https://eufywqjqmiuqepljshtd.supabase.co`

Deploy Edge Functions:
```bash
supabase functions deploy notify
supabase functions deploy advance-delivery
supabase functions deploy generate-tracking-code
supabase functions deploy verify-provider
```

Set Edge Function secrets:
```bash
supabase secrets set RESEND_API_KEY=your-key
```

## 🛠️ Key Technologies

| Technology | Purpose |
|------------|---------|
| Next.js 14 App Router | Framework (Server/Client Components) |
| Supabase | Backend (Postgres, Auth, Realtime, Storage, Edge Functions) |
| TanStack Query | Client state & data fetching |
| React Hook Form | Form handling |
| Zod | Schema validation |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Sonner | Toast notifications |

## 📝 Environment Variables Reference

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Anon/public key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (server-only) | `eyJhbGc...` |
| `SUPABASE_JWT_SECRET` | ⚠️ | JWT secret for token verification | `your-secret` |
| `RESEND_API_KEY` | ⚠️ | Email notifications (Resend) | `re_xxx` |
| `NEXT_PUBLIC_APP_URL` | ✅ | App URL for links in emails | `https://fixbridge.app` |

## 🗂️ Available Scripts

```json
{
  "dev": "next dev",                    // Start dev server
  "build": "next build",                // Build for production
  "start": "next start",                // Start production server
  "lint": "next lint",                  // Run ESLint
  "test": "vitest",                     // Run unit tests
  "test:e2e": "playwright test"         // Run E2E tests
}
```

## 🤝 Contributing

This is a production codebase following best practices:

- **Type Safety**: Full TypeScript coverage, no `any`
- **Security**: RLS on all tables, JWT-based auth, no client-side security decisions
- **Performance**: Server Components by default, Client Components only when needed
- **Code Quality**: ESLint + Prettier configured
- **Testing**: Unit + integration + E2E tests
- **Documentation**: Inline comments for complex logic

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions, contact the development team.

---

Built with ❤️ using Next.js and Supabase
