"use client"
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface BlogPostCardProps {
  post: {
    id: string
    title: string
    date: string
    excerpt: string
    image: string
    link: string
  }
  delay?: number
}

export function BlogPostCard({ post, delay }: BlogPostCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.6, delay: delay || 0, ease: "easeOut" },
        },
      }}
      whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <Link href={post.link} className="block">
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
          />
        </Link>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            <Link href={post.link} className="hover:text-primary transition-colors">
              {post.title}
            </Link>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{post.date}</p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>
          <Link href={post.link} className="inline-flex items-center text-primary hover:underline text-sm font-medium">
            Read More <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
