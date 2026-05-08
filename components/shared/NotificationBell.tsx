'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: notifications = [] } = useNotifications()
  const markAllAsRead = useMarkAllAsRead()

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const recent = notifications.slice(0, 5)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No notifications yet</p>
              ) : (
                recent.map((notif) => (
                  <NotificationItem key={notif.id} notification={notif} onClose={() => setOpen(false)} />
                ))
              )}
            </div>
            <div className="border-t border-gray-100 px-4 py-3">
              <Link
                href="/customer/notifications"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                onClick={() => setOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

interface NotificationItemProps {
  notification: {
    id: string
    title: string
    body: string
    action_url: string | null
    is_read: boolean
    created_at: string
  }
  onClose: () => void
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const markAsRead = useMarkAsRead(notification.id)

  const handleClick = () => {
    if (!notification.is_read) markAsRead.mutate()
    onClose()
  }

  const content = (
    <div className={cn('px-4 py-3 hover:bg-gray-50 transition-colors', !notification.is_read && 'bg-indigo-50/50')}>
      <div className="flex items-start gap-3">
        {!notification.is_read && <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
        <div className={cn('flex-1', notification.is_read && 'pl-5')}>
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</p>
        </div>
      </div>
    </div>
  )

  if (notification.action_url) {
    return (
      <Link href={notification.action_url} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return <div onClick={handleClick} className="cursor-pointer">{content}</div>
}
