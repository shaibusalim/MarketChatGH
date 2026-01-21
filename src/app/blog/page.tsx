import { adminFirestore } from "@/lib/firebase-admin";
import { BlogPostCard } from "@/components/blog-post-card";

async function getBlogPosts() {
  const blogPostsSnapshot = await adminFirestore
    .collection("blogPosts")
    .orderBy("date", "desc")
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

  return blogPosts;
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <div className="container mx-auto py-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">All Blog Posts</h1>
        <p className="text-gray-500 mb-8">
          Stay up-to-date with the latest news and insights.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
