"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, UserCircle, Loader2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { toast } from "react-hot-toast"
import { SellerReviewForm } from "./seller-review-form"

interface Review {
  id: string
  sellerId: string
  rating: number
  comment: string
  userId: string
  createdAt: string
}

interface SellerReviewsDisplayProps {
  sellerId: string
}

export function SellerReviewsDisplay({ sellerId }: SellerReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/reviews?sellerId=${sellerId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || `Failed to fetch reviews (Status: ${response.status})`)
      }
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (err) {
      console.error("[SellerReviewsDisplay] Error fetching reviews:", err)
      setError("Failed to load reviews. Please try again later.")
      toast.error("Failed to load reviews: " + (err as Error).message, { duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }, [sellerId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleReviewSubmitted = () => {
    fetchReviews() // Re-fetch reviews after a new one is submitted
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Review Form */}
      <div>
        <SellerReviewForm sellerId={sellerId} onReviewSubmitted={handleReviewSubmitted} />
      </div>

      {/* Existing Reviews Display */}
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <div className="text-center text-red-500 text-sm py-4">{error}</div>}
          {!isLoading && !error && reviews.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4">
              No reviews yet. Be the first to leave one!
            </div>
          )}
          {!isLoading && !error && reviews.length > 0 && (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {review.userId.startsWith("anonymous-user") ? "Anonymous User" : review.userId}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
