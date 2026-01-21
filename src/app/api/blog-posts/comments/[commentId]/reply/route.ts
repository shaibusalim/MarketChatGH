import { adminFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

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

  if (!commentId) {
    return new NextResponse("Comment ID is required", { status: 400 });
  }

  try {
    const { text, author } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new NextResponse("Reply text is required", { status: 400 });
    }

    const replyRef = adminFirestore
      .collection("blogPosts")
      .doc(commentId.split("_")[0]) // Extract postId from commentId
      .collection("comments")
      .doc(commentId)
      .collection("replies");

    await replyRef.add({
      text,
      author: "Anonymous", // Replace with actual author
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to add reply:", error);
    return new NextResponse("Failed to add reply", { status: 500 });
  }
}
