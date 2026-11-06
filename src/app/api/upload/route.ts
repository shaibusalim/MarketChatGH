import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth.config"
import { adminStorage } from "@/lib/firebase-admin"
import { enforceRateLimit } from "@/lib/ratelimit"

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
}

export async function POST(request: NextRequest) {
  try {
    // Only signed-in sellers / admins may upload.
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Please sign in to upload files." }, { status: 401 })
    }

    // 20 uploads / 10 minutes per IP.
    const limited = await enforceRateLimit(request, "upload", 20, "10 m")
    if (limited) return limited

    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
    }

    // Validate file type (SVG intentionally not allowed: it can carry scripts)
    const ext = EXTENSION_BY_TYPE[file.type]
    if (!ext) {
      return NextResponse.json({
        success: false,
        message: "Invalid file type. Please upload JPEG, PNG, GIF or WebP images only.",
      }, { status: 400 })
    }

    // Validate file size (4MB: stays under the serverless request body limit)
    const maxSize = 4 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: "File too large. Please upload images smaller than 4MB.",
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 1. Try Firebase Storage first (reliable, permanent CDN storage)
    try {
      const bucket = adminStorage.bucket()
      if (bucket) {
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
    const filename = `${timestamp}_${Math.random().toString(36).substring(2, 9)}.${ext}`

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
