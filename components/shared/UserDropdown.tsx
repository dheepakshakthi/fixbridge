"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings, ChevronDown } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

interface UserDropdownProps {
  user: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Error signing out")
    } else {
      toast.success("Signed out successfully")
      router.push("/login")
      router.refresh()
    }
  }

  const fullName = user?.full_name ?? "User"
  const initials = fullName[0]?.toUpperCase() ?? "U"

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700 overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {fullName}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden py-1">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
              <p className="text-xs text-gray-500 truncate">Customer Portal</p>
            </div>

            <Link
              href="/customer/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4 text-gray-400" />
              Profile
            </Link>

            <Link
              href="/customer/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4 text-gray-400" />
              Settings
            </Link>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => {
                setOpen(false)
                handleLogout()
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}
