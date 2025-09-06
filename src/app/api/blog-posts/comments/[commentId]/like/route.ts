import { adminFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import { FieldValue } from "@google-cloud/firestore";

interface Params {
  commentId: string;
}

export async function POST(
  request: Request,
  { params }: { params: Params }
) {
  const { commentId } = params;

  if (!commentId) {
    return new NextResponse("Comment ID is required", { status: 400 });
  }

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
