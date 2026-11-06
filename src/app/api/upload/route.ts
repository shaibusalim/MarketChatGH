import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
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

    // Validate file size (4.5MB: stays under Vercel serverless request body limit)
    const maxSize = 4.5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: "File too large. Please upload images smaller than 4.5MB.",
      }, { status: 400 })
    }

    const filename = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`

    // 1. Primary: Vercel Blob Storage (Permanent, fast global Edge CDN)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(filename, file, {
          access: "public",
          contentType: file.type,
        })

        if (blob?.url) {
          return NextResponse.json({
            success: true,
            message: "File uploaded successfully to Vercel Blob",
            url: blob.url,
          })
        }
      } catch (blobErr) {
        console.warn("[Upload API] Vercel Blob upload failed, trying fallback:", blobErr)
      }
    }

    // 2. Fallback: Firebase Cloud Storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
      const bucket = adminStorage.bucket()
      if (bucket) {
        const storageFile = bucket.file(filename)
        await storageFile.save(buffer, {
          metadata: {
            contentType: file.type,
          },
        })

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
      console.warn("[Upload API] Firebase Storage fallback failed, saving locally:", storageErr)
    }

    // 3. Fallback for local offline development only (public/uploads)
    const uploadDir = join(process.cwd(), "public", "uploads")
    const localFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`
    const filePath = join(uploadDir, localFilename)

    try {
      await writeFile(filePath, buffer)
    } catch {
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filePath, buffer)
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: `/uploads/${localFilename}`,
    })
  } catch (error) {
    console.error("[Upload API] Error:", error)
    return NextResponse.json({
      success: false,
      message: "Upload failed. Please try again.",
    }, { status: 500 })
  }
}
