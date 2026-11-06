import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { adminStorage } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: "Invalid file type. Please upload JPEG, PNG, GIF, WebP, or SVG images only.",
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: "File too large. Please upload images smaller than 10MB.",
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 1. Try Firebase Storage first (reliable, permanent CDN storage)
    try {
      const bucket = adminStorage.bucket()
      if (bucket) {
        const ext = file.name.split(".").pop() || "jpg"
        const filename = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`
        const storageFile = bucket.file(filename)

        await storageFile.save(buffer, {
          metadata: {
            contentType: file.type,
          },
        })

        // Generate long-lived signed URL
        const [signedUrl] = await storageFile.getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        })

        if (signedUrl) {
          return NextResponse.json({
            success: true,
            message: "File uploaded successfully to cloud storage",
            url: signedUrl,
          })
        }
      }
    } catch (storageErr) {
      console.warn("[Upload API] Firebase Storage upload error, falling back to local disk:", storageErr)
    }

    // 2. Fallback to saving to public/uploads directory
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${timestamp}_${originalName}`

    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, filename)

    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filePath, buffer)
    }

    const publicUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: publicUrl,
    })
  } catch (error) {
    console.error("[Upload API] Error:", error)
    return NextResponse.json({
      success: false,
      message: "Upload failed. Please try again.",
    }, { status: 500 })
  }
}
