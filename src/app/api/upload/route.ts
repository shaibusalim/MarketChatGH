import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth.config"
import { enforceRateLimit } from "@/lib/ratelimit"

export const runtime = "nodejs"

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
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (sessionErr) {
      console.error("[Upload API] Session check error:", sessionErr)
    }

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Please sign in to upload files." }, { status: 401 })
    }

    // 20 uploads / 10 minutes per IP.
    try {
      const limited = await enforceRateLimit(request, "upload", 20, "10 m")
      if (limited) return limited
    } catch (rlErr) {
      console.warn("[Upload API] Rate limit check skipped:", rlErr)
    }

    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const ext = EXTENSION_BY_TYPE[file.type]
    if (!ext) {
      return NextResponse.json({
        success: false,
        message: `Invalid file type (${file.type}). Please upload JPEG, PNG, GIF or WebP images only.`,
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

    // Check if BLOB_READ_WRITE_TOKEN is connected
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      console.error("[Upload API] BLOB_READ_WRITE_TOKEN is missing from process.env")
      return NextResponse.json({
        success: false,
        message: "Vercel Blob token is missing. Please ensure your Blob store is linked to this project in the Vercel Dashboard (Storage -> Connect Project) and trigger a redeploy.",
      }, { status: 500 })
    }

    const sanitizedBase = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
    const pathname = `uploads/${Date.now()}_${sanitizedBase || "img"}.${ext}`

    // Upload directly to Vercel Blob
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      token: blobToken,
    })

    if (!blob?.url) {
      return NextResponse.json({
        success: false,
        message: "Blob upload completed but did not return a valid URL.",
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: blob.url,
    })
  } catch (error) {
    console.error("[Upload API Error]:", error)
    const errorDetails = (error as Error)?.message || String(error)
    return NextResponse.json({
      success: false,
      message: `Upload failed: ${errorDetails}`,
    }, { status: 500 })
  }
}
