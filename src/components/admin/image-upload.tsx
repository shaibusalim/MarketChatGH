"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Loader2, Camera, Link as LinkIcon, Check } from "lucide-react"
import Image from "next/image"
import { toast } from "react-hot-toast"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  aspectRatio?: "square" | "video" | "banner"
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  placeholder = "Enter image URL or select a photo",
  aspectRatio = "square",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      let result: any = {}
      try {
        result = await response.json()
      } catch {
        result = { success: false, message: `Server returned HTTP ${response.status} ${response.statusText}` }
      }

      if (result.success && result.url) {
        onChange(result.url)
        toast.success("Photo uploaded successfully!", { duration: 3000 })
      } else {
        toast.error(result.message || `Upload error (${response.status})`, { duration: 7000 })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed. Please try again.", { duration: 5000 })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const clearImage = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const aspectClass =
    aspectRatio === "banner"
      ? "aspect-[3/1] max-h-48"
      : aspectRatio === "video"
      ? "aspect-video"
      : "aspect-square max-w-[200px]"

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </Label>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setUploadMode("upload")}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
              uploadMode === "upload"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("url")}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
              uploadMode === "url"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Web URL
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="hidden"
      />

      {uploadMode === "upload" ? (
        <div>
          {value ? (
            <div className="relative group">
              <div
                className={`relative w-full ${aspectClass} mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-2 mt-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-xl text-xs h-8 font-semibold"
                >
                  <Camera className="h-3.5 w-3.5 mr-1" />
                  Change Photo
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearImage}
                  className="rounded-xl text-xs h-8 font-semibold"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 dark:bg-gray-800/30 hover:bg-emerald-50/30 text-center group"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    Uploading image...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Tap to choose an image from device
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      JPG, PNG, GIF, WebP (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Web URL Mode */
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="url"
              placeholder={placeholder}
              value={value}
              onChange={handleUrlChange}
              className="pl-9 h-11 rounded-xl text-xs font-medium"
            />
          </div>
          {value && (
            <div className={`relative w-full ${aspectClass} mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => {
                  toast.error("Failed to load image preview URL")
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
