import { BlogPostCard } from "@/components/blog-post-card";
import { getLatestBlogPosts } from "@/app/page";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  link: string;
}

async function BlogPosts() {
  const blogPosts = await getLatestBlogPosts();

  return (
    <>
      {blogPosts.map((post: BlogPost) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </>
  );
}

export default BlogPosts;
