'use client'

import { useState } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  variant?: 'danger' | 'primary'
  trigger: React.ReactNode
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'danger',
  trigger,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-600 mb-6">{description}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button variant={variant} onClick={handleConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
