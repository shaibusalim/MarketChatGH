"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  author: string;
  authorImageUrl?: string;
  text: string;
  timestamp: string; // ISO string
}

interface CommentsSectionProps {
  postId: string;
  initialComments: Comment[];
}

export function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !author.trim()) return;

    const optimisticComment: Comment = {
      id: Date.now().toString(),
      author: author.trim(),
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    setComments([optimisticComment, ...comments]);
    setNewComment("");
    setAuthor("");

    try {
      await fetch(`/api/blog-posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment, author: author.trim() }),
      });
    } catch (error) {
      console.error("Failed to post comment:", error);
      // Revert optimistic update on failure
      setComments(comments);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>
      <form onSubmit={handleSubmitComment} className="mb-8 space-y-4">
        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          required
        />
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={4}
          required
        />
        <Button type="submit" disabled={!newComment.trim() || !author.trim()}>
          Post Comment
        </Button>
      </form>
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={comment.authorImageUrl} alt={comment.author} />
              <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{comment.author}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
