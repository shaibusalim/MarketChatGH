import { adminFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/ratelimit";
import { FieldValue } from "@google-cloud/firestore";

export const runtime = "nodejs";

interface Params {
  commentId: string;
}

export async function POST(
  request: Request,
  props: { params: Promise<Params> }
) {
  const params = await props.params;
  const { commentId } = params;

  if (!commentId || commentId.length > 200) {
    return new NextResponse("Comment ID is required", { status: 400 });
  }

  const limited = await enforceRateLimit(request, "blog-comment-like", 20, "1 m");
  if (limited) return limited;

  try {
    const commentRef = adminFirestore
      .collection("blogPosts")
      .doc(commentId.split("_")[0]) // Extract postId from commentId
      .collection("comments")
      .doc(commentId);

    // Increment the likes count
    await commentRef.update({
      likes: FieldValue.increment(1),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to like comment:", error);
    return new NextResponse("Failed to like comment", { status: 500 });
  }
}
