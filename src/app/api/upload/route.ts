import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: "Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.",
      })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: "File too large. Please upload images smaller than 5MB.",
      })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_") // Sanitize filename
    const filename = `${timestamp}_${originalName}`

    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, filename)

    // Create uploads directory if it doesn't exist
    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      // If directory doesn't exist, create it and try again
      const { mkdir } = await import("fs/promises")
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filePath, buffer)
    }

    // Return the public URL
    const publicUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: publicUrl,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({
      success: false,
      message: "Upload failed. Please try again.",
    })
  }
}
