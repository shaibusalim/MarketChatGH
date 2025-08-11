"use client"

import type React from "react"
import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect, useCallback } from "react"
import { BlogPostCard } from "./blog-post-card"
import { Loader2 } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  imageUrl: string
  content: string // Add content for individual page
}

// Re-using AnimatedGradientText from interactive-elements.tsx
const AnimatedGradientText = ({ children }: { children: React.ReactNode }) => (
  <motion.span
    initial={{ backgroundPosition: "0% 50%" }}
    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
    transition={{
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "linear",
    }}
    whileHover={{ scale: 1.05, backgroundPosition: "50% 50%" }}
    className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 bg-clip-text text-transparent bg-[length:300%_auto]"
  >
    {children}
  </motion.span>
)

export function BlogSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBlogPosts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/blog-posts")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch blog posts (Status: ${response.status})`)
      }
      const data = await response.json()
      setBlogPosts(data.blogPosts || [])
    } catch (err) {
      console.error("[BlogSection] Error fetching blog posts:", err)
      setError("Failed to load blog posts. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogPosts()
  }, [fetchBlogPosts])

  return (
    <section id="blog" className="relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline mb-3">
          <AnimatedGradientText>Latest from Our Blog</AnimatedGradientText>
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Stay updated with the latest news, insights, and success stories from MarketChat.
        </p>
      </motion.div>
      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {error && <div className="text-center text-red-500 text-sm py-4">{error}</div>}
      {!isLoading && !error && blogPosts.length === 0 && (
        <div className="text-center text-muted-foreground text-lg py-10">
          No blog posts found at the moment. Check back soon!
        </div>
      )}
      {!isLoading && !error && blogPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <BlogPostCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                date: new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                excerpt: post.excerpt,
                image: post.imageUrl,
                link: `/blog/${post.id}`, // Link to the dynamic blog post page
              }}
              delay={0.1 * index}
            />
          ))}
        </div>
      )}
    </section>
  )
}
