import { adminFirestore } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { LikeButton } from "@/components/LikeButton";
import { CommentsSection } from "@/components/CommentsSection";

export const revalidate = 0; // Ensure data is always fresh

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string; // ISO string
  likes: number;
}

interface Comment {
  id: string;
  author: string;
  authorImageUrl?: string;
  text: string;
  timestamp: string; // ISO string
}

async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const docRef = adminFirestore.collection("blogPosts").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data?.title ?? "Untitled Post",
      excerpt: data?.excerpt ?? "No excerpt available.",
      content: data?.content ?? "No content available.",
      imageUrl: data?.imageUrl ?? "/placeholder.svg?height=400&width=800",
      date: data?.date ?? new Date().toISOString(),
      likes: data?.likes ?? 0,
    };
  } catch (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    throw new Error("Failed to fetch blog post.");
  }
}

async function getComments(postId: string): Promise<Comment[]> {
  try {
    const commentsRef = adminFirestore
      .collection("blogPosts")
      .doc(postId)
      .collection("comments")
      .orderBy("timestamp", "desc");
    const snapshot = await commentsRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        author: data.author,
        authorImageUrl: data.authorImageUrl,
        text: data.text,
        timestamp: data.timestamp.toDate().toISOString(),
        likes: data.likes || 0,
      };
    });
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return []; // Return empty array on error
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const [blogPost, comments] = await Promise.all([
    getBlogPost(params.id),
    getComments(params.id),
  ]);

  if (!blogPost) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative w-full h-64 sm:h-80 md:h-96">
          <Image
            src={blogPost.imageUrl || "/placeholder.svg"}
            alt={blogPost.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            priority
          />
        </div>
        <div className="p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {blogPost.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Published on {format(new Date(blogPost.date), "MMMM dd, yyyy")}
          </p>
          <div
            className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed mb-8"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <LikeButton postId={blogPost.id} initialLikes={blogPost.likes} />
          </div>

          <div className="mt-10">
            <CommentsSection
              postId={blogPost.id}
              initialComments={comments}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
