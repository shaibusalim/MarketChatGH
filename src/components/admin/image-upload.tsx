"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "react-hot-toast"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  placeholder = "Enter image URL or upload file",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("url")
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

      const result = await response.json()

      if (result.success) {
        onChange(result.url)
        toast.success("Image uploaded successfully!", { duration: 3000 })
      } else {
        toast.error(result.message || "Upload failed", { duration: 5000 })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed. Please try again.", { duration: 5000 })
    } finally {
      setIsUploading(false)
      // Reset file input
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

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Label>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <Button
          type="button"
          variant={uploadMode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMode("url")}
          className="text-xs"
        >
          URL
        </Button>
        <Button
          type="button"
          variant={uploadMode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMode("upload")}
          className="text-xs"
        >
          Upload
        </Button>
      </div>

      {uploadMode === "url" ? (
        /* URL Input Mode */
        <div className="space-y-2">
          <Input type="url" placeholder={placeholder} value={value} onChange={handleUrlChange} className="w-full" />
        </div>
      ) : (
        /* File Upload Mode */
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            </Button>
          </div>
          {isUploading && <p className="text-xs text-blue-600 dark:text-blue-400">Uploading image...</p>}
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
            {value.startsWith("http") || value.startsWith("/") ? (
              <Image
                src={value || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => {
                  toast.error("Failed to load image preview", { duration: 3000 })
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Invalid image URL</span>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={clearImage}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Guidelines */}
      {uploadMode === "upload" && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
          <p>• Maximum file size: 5MB</p>
          <p>• Recommended dimensions: 800x400px for blog posts</p>
        </div>
      )}
    </div>
  )
}
