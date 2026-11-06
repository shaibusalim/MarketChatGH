import { adminFirestore } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { enforceRateLimit, getClientIp } from "@/lib/ratelimit"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface ReviewData {
  sellerId: string
  rating: number
  comment: string
  userId: string // Placeholder for user ID
  createdAt: string
}

export async function POST(request: Request) {
  
  try {
    // Anti-spam: 5 reviews / 10 min per IP overall, and max 2 per day per IP for any single seller.
    const limited = await enforceRateLimit(request, "reviews", 5, "10 m")
    if (limited) return limited

    const { sellerId, rating, comment, userId } = (await request.json()) as {
      sellerId: string
      rating: number
      comment: string
      userId: string
    }

    if (
      typeof sellerId !== "string" ||
      !sellerId ||
      sellerId.length > 128 ||
      typeof rating !== "number" ||
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5 ||
      typeof comment !== "string" ||
      !comment.trim() ||
      typeof userId !== "string" ||
      !userId ||
      userId.length > 128
    ) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    const perSellerLimited = await enforceRateLimit(
      request,
      "reviews-per-seller",
      2,
      "1 d",
      `${getClientIp(request)}:${sellerId}`,
    )
    if (perSellerLimited) return perSellerLimited

    const reviewData: ReviewData = {
      sellerId,
      rating,
      comment: comment.trim().slice(0, 1000),
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
