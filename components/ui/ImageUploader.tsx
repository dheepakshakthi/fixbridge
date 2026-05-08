'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from './Button'
import { X, Upload } from 'lucide-react'
import { toast } from 'sonner'

// Button is available for future use (e.g. a "clear all" action)
void Button

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  userId: string
  folder?: string
}

export function ImageUploader({
  value,
  onChange,
  maxImages = 5,
  userId,
  folder = 'ticket-images',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = maxImages - value.length
    if (files.length > remaining) {
      toast.error(`You can upload at most ${remaining} more image(s)`)
      return
    }

    // Validate files
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPG, PNG, and WebP images are allowed')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 5MB size limit`)
        return
      }
    }

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error } = await supabase.storage
          .from('ticket-images')
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('ticket-images')
          .getPublicUrl(path)

        uploadedUrls.push(publicUrl)
      }
      onChange([...value, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} image(s) uploaded`)
    } catch {
      toast.error('Failed to upload image(s)')
    } finally {
      setUploading(false)
    }
  }, [value, onChange, maxImages, userId, folder, supabase])

  const removeImage = (url: string) => {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Upload" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        {value.length < maxImages && (
          <label className={`relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <svg className="h-5 w-5 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <Upload className="h-5 w-5 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add photo</span>
              </>
            )}
          </label>
        )}
      </div>
      <p className="text-xs text-gray-500">{value.length}/{maxImages} images • JPG, PNG, WebP • Max 5MB each</p>
    </div>
  )
}
