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

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      setIsOwner(post.user_id === user.id);
    }
  };

  const checkLikeStatus = async () => {
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
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(
        `
        *,
        user:users(id, name, avatar_url)
      `
      )
      .eq("post_id", post.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setComments(data);
  };

  const handleLike = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
      setLikesCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: user.id,
      });
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
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
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    // Delete from database
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (!error) {
      // Cascade delete will handle likes and comments
      // (assuming you have RLS policies set up)
      onDelete(post.id);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user?.name}`,
          text: post.caption || "",
          url: url,
        });
      } catch (err) {
        // User cancelled or error occurred
        navigator.clipboard.writeText(url);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const createRipple = (e: React.MouseEvent) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  };

  // Truncate long captions with "Read more"
  const truncateCaption = (text: string, lines: number = 3) => {
    const textLines = text.split("\n");
    if (textLines.length > lines) {
      return textLines.slice(0, lines).join("\n") + "...";
    }
    return text;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-6">
      {/* Clean Instagram-style card with floating island design */}
      <div className="floating-island-lg floating-island-hover">
        
        {/* Post Header - Avatar, Username, Timestamp, Menu */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
              {post.user?.avatar_url ? (
                <Image
                  src={post.user.avatar_url}
                  alt={post.user.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {post.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Username & Timestamp */}
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

          {/* Menu */}
          <PostMenu
            postId={post.id}
            isOwner={isOwner}
            onDelete={handleDelete}
          />
        </div>

        {/* Post Image - Full width, no borders */}
        {post.type === "photo" && post.media_url && (
          <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Image
              src={post.media_url}
              alt={post.caption || "Post image"}
              fill
              className="object-cover hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>
        )}

        {/* Action Buttons - Like, Comment, Share */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              type="button"
              onClick={(e) => {
                createRipple(e);
                handleLike();
              }}
              className="p-2 -m-2 hover:opacity-60 transition-opacity duration-200 active:scale-90"
              title={`${likesCount} likes`}
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <FiHeart
                className={`w-6 h-6 transition-all duration-200 ${
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "text-black dark:text-white"
                }`}
              />
            </button>

            {/* Comment Button */}
            <button
              type="button"
              onClick={(e) => {
                createRipple(e);
                setShowComments(!showComments);
              }}
              className="p-2 -m-2 hover:opacity-60 transition-opacity duration-200 active:scale-90"
              title={`${comments.length} comments`}
              aria-label="View comments"
            >
              <FiMessageCircle className="w-6 h-6 text-black dark:text-white" />
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={(e) => {
                createRipple(e);
                handleShare();
              }}
              className="p-2 -m-2 hover:opacity-60 transition-opacity duration-200 active:scale-90"
              title="Share"
              aria-label="Share post"
            >
              <FiShare2 className="w-6 h-6 text-black dark:text-white" />
            </button>
          </div>
        </div>

        {/* Like Count */}
        <div className="px-4 py-2 font-semibold text-sm text-black dark:text-white">
          {likesCount > 0 && (
            <span>{likesCount} {likesCount === 1 ? "like" : "likes"}</span>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
            <p className="text-sm text-black dark:text-white leading-snug">
              <span className="font-semibold">{post.user?.name}</span>{" "}
              <span className="text-gray-800 dark:text-gray-200">
                {truncateCaption(post.caption, 2)}
              </span>
            </p>
          </div>
        )}

        {/* Comments Count Link */}
        {comments.length > 0 && !showComments && (
          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="w-full px-4 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            aria-label={`View all ${comments.length} comments`}
          >
            View all {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </button>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-200 dark:border-gray-800">
            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-64 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="px-4 py-3 flex gap-3">
                    {/* Comment Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
                      {comment.user?.avatar_url ? (
                        <Image
                          src={comment.user.avatar_url}
                          alt={comment.user.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black dark:text-white">
                        <span className="font-semibold">{comment.user?.name}</span>{" "}
                        <span className="text-gray-800 dark:text-gray-200">
                          {comment.content}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No comments yet
              </p>
            )}

            {/* Comment Input */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all duration-200"
              />
              <button
                type="button"
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="px-3 py-2 text-sm font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:text-gray-300 dark:disabled:text-gray-700 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Post comment"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
