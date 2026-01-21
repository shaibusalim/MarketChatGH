import { adminFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const blogPostsSnapshot = await adminFirestore
      .collection("blogPosts")
      .orderBy("date", "desc")
      .limit(3)
      .get();

    const blogPosts = blogPostsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Untitled Post",
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || "No excerpt available",
        image: data.imageUrl || "/img1.jpg",
        link: `/blog/${doc.id}`,
      };
    });

    return NextResponse.json(blogPosts);
  } catch (error) {
    console.error("Error fetching latest blog posts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
