"use server"

import { adminFirestore } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"

// Helper to simulate delay for network requests
const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface BlogPostData {
  title: string
  excerpt: string
  content: string
  imageUrl: string
  date: string // ISO string
}

export async function createBlogPost(formData: FormData) {
  await simulateDelay(500)

  const title = formData.get("title") as string
  const excerpt = formData.get("excerpt") as string
  const content = formData.get("content") as string
  const imageUrl = formData.get("imageUrl") as string

  if (!title || !excerpt || !content || !imageUrl) {
    return { success: false, message: "All fields are required." }
  }

  try {
    const newPost: BlogPostData = {
      title,
      excerpt,
      content,
      imageUrl,
      date: new Date().toISOString(), // Set current date
    }

    await adminFirestore.collection("blogPosts").add(newPost)

    revalidatePath("/admin/blog") // Revalidate the blog admin page
    revalidatePath("/") // Revalidate the home page where blog section is
    return { success: true, message: "Blog post created successfully!" }
  } catch (error) {
    console.error("Error creating blog post:", error)
    return { success: false, message: `Failed to create blog post: ${(error as Error).message}` }
  }
}

export async function updateBlogPost(formData: FormData) {
  await simulateDelay(500)

  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const excerpt = formData.get("excerpt") as string
  const content = formData.get("content") as string
  const imageUrl = formData.get("imageUrl") as string

  if (!id || !title || !excerpt || !content || !imageUrl) {
    return { success: false, message: "All fields are required." }
  }

  try {
    const updatedPost: Partial<BlogPostData> = {
      title,
      excerpt,
      content,
      imageUrl,
    }

    await adminFirestore.collection("blogPosts").doc(id).update(updatedPost)

    revalidatePath("/admin/blog") // Revalidate the blog admin page
    revalidatePath("/") // Revalidate the home page where blog section is
    revalidatePath(`/blog/${id}`) // Revalidate the specific blog post page
    return { success: true, message: "Blog post updated successfully!" }
  } catch (error) {
    console.error("Error updating blog post:", error)
    return { success: false, message: `Failed to update blog post: ${(error as Error).message}` }
  }
}

export async function deleteBlogPost(formData: FormData) {
  await simulateDelay(300)

  const id = formData.get("id") as string

  if (!id) {
    return { success: false, message: "Blog post ID is required." }
  }

  try {
    await adminFirestore.collection("blogPosts").doc(id).delete()

    revalidatePath("/admin/blog") // Revalidate the blog admin page
    revalidatePath("/") // Revalidate the home page where blog section is
    revalidatePath(`/blog/${id}`) // Revalidate the specific blog post page
    return { success: true, message: "Blog post deleted successfully!" }
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return { success: false, message: `Failed to delete blog post: ${(error as Error).message}` }
  }
}
