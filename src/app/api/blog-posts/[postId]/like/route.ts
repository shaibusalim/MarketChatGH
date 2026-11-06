import { NextResponse } from "next/server"
import { adminFirestore } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { enforceRateLimit } from "@/lib/ratelimit"

export const runtime = "nodejs"

export async function POST(
  req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  try {
    const { postId } = params
    if (!postId || postId.length > 128) {
      return new NextResponse("Post ID is required", { status: 400 })
    }

    const limited = await enforceRateLimit(req, "blog-like", 20, "1 m")
    if (limited) return limited

    const postRef = adminFirestore.collection("blogPosts").doc(postId)

    // Atomically increment the likes count
    await postRef.update({
      likes: FieldValue.increment(1),
    })

    return new NextResponse("Like count updated successfully", { status: 200 })
  } catch (error) {
    console.error("Error updating like count:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
