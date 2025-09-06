"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CommentLikeButtonProps {
  commentId: string;
  initialLikes: number;
}

export function CommentLikeButton({ commentId, initialLikes }: CommentLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    setLoading(true);
    try {
      // Optimistically update the likes
      setLikes(likes + 1);
      await fetch(`/api/blog-posts/comments/${commentId}/like`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to like comment:", error);
      // Revert the optimistic update on failure
      setLikes(likes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={loading}
    >
      Like ({likes})
    </Button>
  );
}
