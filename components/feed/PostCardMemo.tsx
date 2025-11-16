"use client";

import { memo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types";
import { FiHeart, FiMessageCircle, FiShare2 } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import PostMenu from "./PostMenu";

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

// Memoized component to prevent unnecessary re-renders
const PostCard = memo(function PostCard({ post, onDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkLikeStatus();
    loadComments();
    getCurrentUser();
  }, [post.id]);

  const getCurrentUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      setIsOwner(post.user_id === user.id);
    }
  }, [post.user_id, supabase]);

  const checkLikeStatus = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .single();

    setIsLiked(!!data);
  }, [post.id, supabase]);

  const loadComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          user:users(id, name, avatar_url)
        `
        )
        .eq("post_id", post.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setComments(data);
      }
    } catch (error) {
      // Error handled silently
    }
  }, [post.id, supabase]);

  const handleLike = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
      setIsLiked(false);
      setLikesCount(Math.max(0, likesCount - 1));
    } else {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: user.id,
      });
      setLikesCount(likesCount + 1);
      setIsLiked(true);
    }
  }, [isLiked, likesCount, post.id, supabase]);

  const handleComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: commentText,
        })
        .select(
          `
          *,
          user:users(id, name, avatar_url)
        `
        )
        .single();

      if (data && !error) {
        setComments([data, ...comments]);
        setCommentText("");
      }
    },
    [commentText, comments, post.id, supabase]
  );

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    if (!error) {
      onDelete(post.id);
    }
  }, [onDelete, post.id, supabase]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user?.name}`,
          text: post.caption || "",
          url: url,
        });
      } catch (err) {
        navigator.clipboard.writeText(url);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  }, [post.id, post.user?.name, post.caption]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-6 px-0 sm:px-2">
      <div className="floating-island-lg floating-island-hover">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
              {post.user?.avatar_url ? (
                <Image
                  src={post.user.avatar_url}
                  alt={post.user.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {post.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-sm text-black dark:text-white truncate">
                {post.user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <PostMenu
            postId={post.id}
            isOwner={isOwner}
            onDelete={handleDelete}
          />
        </div>

        {post.type === "photo" && post.media_url && (
          <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Image
              src={post.media_url}
              alt={post.caption || "Post image"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 640px"
              priority={false}
              loading="lazy"
            />
          </div>
        )}

        <div className="p-4 space-y-4">
          {post.caption && (
            <p className="text-black dark:text-white text-sm leading-relaxed">
              {post.caption}
            </p>
          )}

          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
            <span>{likesCount} likes</span>
            <span>{comments.length} comments</span>
          </div>

          <div
            className="flex items-center gap-4 pt-2 will-change-auto"
            style={{ willChange: "auto" }}
          >
            <button
              onClick={handleLike}
              type="button"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors active:scale-95"
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <FiHeart
                className={`w-5 h-5 ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              type="button"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors active:scale-95"
              aria-label="Open comments"
            >
              <FiMessageCircle className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              type="button"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors active:scale-95"
              aria-label="Share post"
            >
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showComments && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-xs text-black dark:text-white">
                      {comment.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={handleComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 glass-input px-3 py-2 text-sm rounded-lg"
              />
              <button
                type="submit"
                className="glass-btn px-3 py-2 text-sm"
                aria-label="Post comment"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
});

export default PostCard;
