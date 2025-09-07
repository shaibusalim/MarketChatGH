import { useState, useEffect } from "react";
import { BlogPostCard } from "@/components/blog-post-card";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  link: string;
}

function BlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function fetchBlogPosts() {
      const res = await fetch("/api/latest-blog-posts");
      const data: BlogPost[] = await res.json();
      setBlogPosts(data);
    }

    fetchBlogPosts();
  }, []);

  return (
    <>
      {blogPosts.map((post: BlogPost) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </>
  );
}

export default BlogPosts;
