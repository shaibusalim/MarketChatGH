"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface LikeButtonProps {
  postId: string
  initialLikes: number
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = async () => {
    const newLikes = isLiked ? likes - 1 : likes + 1
    setLikes(newLikes)
    setIsLiked(!isLiked)

    try {
      await fetch(`/api/blog-posts/${postId}/like`, { method: "POST" })
    } catch (error) {
      console.error("Failed to update like count:", error)
      // Revert optimistic update on failure
      setLikes(likes)
      setIsLiked(isLiked)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={handleLike}>
        <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
      </Button>
      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
        {likes} {likes === 1 ? "Like" : "Likes"}
      </span>
    </div>
  )
}
