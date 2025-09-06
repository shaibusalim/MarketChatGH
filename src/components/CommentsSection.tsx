"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { CommentLikeButton } from "@/components/CommentLikeButton";

interface Comment {
  id: string;
  author: string;
  authorImageUrl?: string;
  text: string;
  timestamp: string; // ISO string
  likes?: number;
}

interface CommentsSectionProps {
  postId: string;
  initialComments: Comment[];
}

export function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || (!author.trim() && replyingTo === null) || loading) return;
    setLoading(true);

    const isReply = replyingTo !== null;

    const optimisticComment: Comment = {
      id: `${postId}_${Date.now().toString()}`,
      author: author.trim(),
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    setComments([optimisticComment, ...comments]);
    setNewComment("");
    setAuthor("");
    setReplyingTo(null);

    try {
      const url = isReply
        ? `/api/blog-posts/comments/${replyingTo}/reply`
        : `/api/blog-posts/${postId}/comment`;
      const method = "POST";
      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify({ text: newComment, author: author.trim() });

      await fetch(url, { method, headers, body });
    } catch (error) {
      console.error("Failed to post comment:", error);
      // Revert optimistic update on failure
      setComments(comments);
    } finally {
      setLoading(false);
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
          disabled={loading}
        />
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={4}
          required
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={!newComment.trim() || !author.trim() || loading}
        >
          {loading ? "Posting..." : "Post Comment"}
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
              <div className="flex items-center space-x-2">
                <CommentLikeButton commentId={comment.id} initialLikes={comment.likes || 0} />
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)}>
                  Reply
                </Button>
              </div>
              </div>
              {replyingTo === comment.id && (
              <form onSubmit={handleSubmitComment} className="mt-4 space-y-2 ml-8">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  required
                  disabled={loading}
                  className="w-full"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || loading}
                  >
                    {loading ? "Replying..." : "Reply"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
