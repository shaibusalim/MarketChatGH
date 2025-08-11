import { adminFirestore } from "@/lib/firebase-admin"
import { notFound } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"

export const revalidate = 0 // Ensure data is always fresh

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  date: string // ISO string
}

async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const docRef = adminFirestore.collection("blogPosts").doc(id)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      title: data?.title ?? "Untitled Post",
      excerpt: data?.excerpt ?? "No excerpt available.",
      content: data?.content ?? "No content available.",
      imageUrl: data?.imageUrl ?? "/placeholder.svg?height=400&width=800",
      date: data?.date ?? new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error fetching blog post ${id}:`, error)
    throw new Error("Failed to fetch blog post.")
  }
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const blogPost = await getBlogPost(params.id)

  if (!blogPost) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative w-full h-64 sm:h-80 md:h-96">
          <Image
            src={blogPost.imageUrl || "/placeholder.svg"}
            alt={blogPost.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            priority
          />
        </div>
        <div className="p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{blogPost.title}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Published on {format(new Date(blogPost.date), "MMMM dd, yyyy")}
          </p>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            {/* This assumes content is plain text. For rich text, you'd use a library like 'react-markdown' */}
            <p>{blogPost.content}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
