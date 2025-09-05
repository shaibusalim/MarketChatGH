import { NextResponse } from "next/server"
import { adminFirestore } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    if (!postId) {
      return new NextResponse("Post ID is required", { status: 400 })
    }

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
