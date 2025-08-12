import { adminFirestore } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic" // Ensure this API route is dynamic

interface ReviewData {
  sellerId: string
  rating: number
  comment: string
  userId: string // Placeholder for user ID
  createdAt: string
}

export async function POST(request: Request) {
  
  try {
    const { sellerId, rating, comment, userId } = (await request.json()) as {
      sellerId: string
      rating: number
      comment: string
      userId: string
    }

    if (!sellerId || typeof rating !== "number" || rating < 1 || rating > 5 || !comment || !userId) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    const reviewData: ReviewData = {
      sellerId,
      rating,
      comment,
      userId,
      createdAt: new Date().toISOString(),
    }

    // Use a Firestore transaction to ensure atomicity
    await adminFirestore.runTransaction(async (transaction) => {
      const sellerRef = adminFirestore.collection("sellers").doc(sellerId)
      const sellerDoc = await transaction.get(sellerRef)

      if (!sellerDoc.exists) {
        throw new Error("Seller not found.")
      }

      const currentSellerData = sellerDoc.data()
      const currentRating = currentSellerData?.rating || 0
      const currentReviewCount = currentSellerData?.reviewCount || 0

      // Calculate new average rating
      const newReviewCount = currentReviewCount + 1
      const newAverageRating = (currentRating * currentReviewCount + rating) / newReviewCount

      // Add the new review
      const reviewRef = adminFirestore.collection("reviews").doc() // Let Firestore generate ID
      transaction.set(reviewRef, reviewData)

      // Update seller's average rating and review count
      transaction.update(sellerRef, {
        rating: newAverageRating,
        reviewCount: newReviewCount,
      })
    })

    // Revalidate the seller's page to show updated rating and new review
    revalidatePath(`/sellers/${sellerId}`)
    revalidatePath(`/sellers`) // Also revalidate the main sellers page if average rating is displayed there

    
    return NextResponse.json({ success: true, message: "Review submitted successfully!" }, { status: 200 })
  } catch (error) {
    
    return NextResponse.json({ error: "Failed to submit review", details: (error as Error).message }, { status: 500 })
  }
}

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 })
    }

    const reviewsSnapshot = await adminFirestore
      .collection("reviews")
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .get()

    const reviews = reviewsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ reviews }, { status: 200 })
  } catch (error) {
   
    return NextResponse.json({ error: "Failed to fetch reviews", details: (error as Error).message }, { status: 500 })
  }
}
