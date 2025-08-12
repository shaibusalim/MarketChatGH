import { adminFirestore } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic" // Ensure this API route is dynamic

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  date: string // ISO string
}

export async function GET() {
  try {
    const blogPostsSnapshot = await adminFirestore.collection("blogPosts").orderBy("date", "desc").get()
    const blogPosts: BlogPost[] = blogPostsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title ?? "Untitled Post",
        excerpt: data.excerpt ?? "No excerpt available.",
        content: data.content ?? "No content available.",
        imageUrl: data.imageUrl ?? "/placeholder.svg?height=250&width=400",
        date: data.date ?? new Date().toISOString(),
      }
    })
    return NextResponse.json({ blogPosts }, { status: 200 })
  } catch (error) {
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
