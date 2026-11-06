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

    // Validate file type
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

    // Check if BLOB_READ_WRITE_TOKEN is connected
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      console.error("[Upload API] BLOB_READ_WRITE_TOKEN is missing on Vercel.")
      return NextResponse.json({
        success: false,
        message: "Vercel Blob is not connected to this deployment. Please connect your Blob store in the Vercel Dashboard and redeploy.",
      }, { status: 500 })
    }

    const filename = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`

    // Upload directly to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
      token: blobToken,
    })

    if (!blob?.url) {
      throw new Error("Vercel Blob did not return a valid download URL.")
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: blob.url,
    })
  } catch (error) {
    console.error("[Upload API] Error:", error)
    const errorMsg = (error as Error)?.message || "Upload failed. Please try again."
    return NextResponse.json({
      success: false,
      message: errorMsg,
    }, { status: 500 })
  }
}
