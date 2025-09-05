import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    if (!postId) {
      return new NextResponse("Post ID is required", { status: 400 });
    }

    const { text, author } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new NextResponse("Comment text is required", { status: 400 });
    }
    if (!author || typeof author !== "string" || author.trim().length === 0) {
      return new NextResponse("Author name is required", { status: 400 });
    }

    const commentsRef = adminFirestore
      .collection("blogPosts")
      .doc(postId)
      .collection("comments");

    const newComment = {
      text,
      author: author.trim(),
      timestamp: new Date(),
    };

    await commentsRef.add(newComment);

    return new NextResponse("Comment added successfully", { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
