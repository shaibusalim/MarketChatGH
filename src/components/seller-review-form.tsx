"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

interface SellerReviewFormProps {
  sellerId: string
  onReviewSubmitted: () => void
}

export function SellerReviewForm({ sellerId, onReviewSubmitted }: SellerReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError("Please select a star rating.")
      return
    }
    if (!comment.trim()) {
      setError("Please enter a comment for your review.")
      return
    }

    startTransition(async () => {
      try {
        // In a real application, userId would come from an authentication context (e.g., NextAuth.js session)
        const userId = "anonymous-user-" + Math.random().toString(36).substring(7) // Placeholder for now

        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sellerId, rating, comment, userId }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || "Failed to submit review.")
        }

        toast.success("Review submitted successfully!", { duration: 3000 })
        setRating(0)
        setComment("")
        onReviewSubmitted() // Callback to refresh reviews on parent
      } catch (err) {
        console.error("Error submitting review:", err)
        setError((err as Error).message)
        toast.error("Failed to submit review: " + (err as Error).message, { duration: 5000 })
      }
    })
  }

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="sr-only">
              Your Comment
            </label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this seller..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full"
              disabled={isPending}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
