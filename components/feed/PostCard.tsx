"use client";

import { useState, useEffect } from "react";
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

export default function PostCard({ post, onDelete }: PostCardProps) {
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

  return (
    <div className="mx-0 sm:mx-4 md:mx-6 mb-4 sm:mb-6 group">
      {/* Card with enhanced glass effect and depth */}
      <div className="rounded-[24px] sm:rounded-[32px] bg-white/8 dark:bg-white/5 backdrop-blur-xl saturate-110 border border-white/25 dark:border-white/15 shadow-depth-lg overflow-hidden transition-all duration-300 hover:shadow-depth-lg hover:border-white/35 dark:hover:border-white/25 hover:bg-white/12 dark:hover:bg-white/8">
    
        {/* Post Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-br from-white/5 to-transparent dark:from-white/2 dark:to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/20 overflow-hidden ring-2 ring-white/10 dark:ring-white/5 transition-all duration-300 hover:ring-white/20 dark:hover:ring-white/10">
              {post.user?.avatar_url ? (
                <Image
                  src={post.user.avatar_url}
                  alt={post.user.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 dark:bg-white/5 flex items-center justify-center text-black dark:text-white font-semibold text-sm">
                  {post.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-xs sm:text-sm text-black dark:text-white">{post.user?.name}</p>
              <p className="text-[10px] sm:text-xs text-black/60 dark:text-white/60">
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

        {/* Post Media - Enhanced with premium styling */}
        {post.type === "photo" && post.media_url && (
          <div className="relative w-full aspect-[4/5] mx-4 sm:mx-5 mb-2 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 dark:border-white/10 shadow-lg group/media">
            <Image
              src={post.media_url}
              alt={post.caption || "Post image"}
              fill
              className="object-cover transition-transform duration-500 group-hover/media:scale-105"
              sizes="(max-width: 428px) 100vw, 428px"
            />
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        {/* Post Actions - Premium circular buttons */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                createRipple(e);
                handleLike();
              }}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-xl saturate-110 border flex items-center justify-center active:scale-95 transition-all relative overflow-hidden touch-target ring-2 ring-offset-2 ring-offset-white/5 dark:ring-offset-black/30 ${
                isLiked
                  ? "bg-white/20 dark:bg-white/15 border-white/40 dark:border-white/30 ring-red-500/50 hover:bg-white/25 dark:hover:bg-white/20"
                  : "bg-white/8 dark:bg-white/5 border-white/25 dark:border-white/15 ring-white/10 hover:bg-white/12 dark:hover:bg-white/8 hover:ring-white/20"
              }`}
              title={`${likesCount} likes`}
            >
              <FiHeart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                  isLiked
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-black/70 dark:text-white/80 hover:scale-110"
                }`}
              />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-black dark:text-white min-w-[24px] sm:min-w-[30px] tabular-nums">
              {likesCount}
            </span>

            <button
              onClick={(e) => {
                createRipple(e);
                setShowComments(!showComments);
              }}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-xl saturate-110 border flex items-center justify-center active:scale-95 transition-all relative overflow-hidden touch-target ring-2 ring-offset-2 ring-offset-white/5 dark:ring-offset-black/30 ${
                showComments
                  ? "bg-white/20 dark:bg-white/15 border-white/40 dark:border-white/30 ring-blue-500/50 hover:bg-white/25 dark:hover:bg-white/20"
                  : "bg-white/8 dark:bg-white/5 border-white/25 dark:border-white/15 ring-white/10 hover:bg-white/12 dark:hover:bg-white/8 hover:ring-white/20"
              }`}
              title={`${comments.length} comments`}
            >
              <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-black/70 dark:text-white/80 transition-all duration-300 group-hover:scale-110" />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-black dark:text-white min-w-[24px] sm:min-w-[30px] tabular-nums">
              {comments.length}
            </span>

            <button
              onClick={(e) => {
                createRipple(e);
                handleShare();
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/8 dark:bg-white/5 backdrop-blur-xl saturate-110 border border-white/25 dark:border-white/15 flex items-center justify-center hover:bg-white/12 dark:hover:bg-white/8 active:scale-95 transition-all relative overflow-hidden ml-auto touch-target ring-2 ring-offset-2 ring-offset-white/5 dark:ring-offset-black/30 ring-white/10 hover:ring-white/20"
              title="Share"
            >
              <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5 text-black/70 dark:text-white/80 transition-all duration-300 group-hover:scale-110" />
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
              <p className="text-xs sm:text-sm text-black dark:text-white leading-relaxed px-1">
                <span className="font-semibold text-black dark:text-white/95">{post.user?.name}</span>{" "}
                <span className="text-black/80 dark:text-white/75">{post.caption}</span>
              </p>
          )}

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-3 pt-4 border-t border-white/15 dark:border-white/10 animate-in fade-in duration-200">
              {comments.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group/comment">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/12 dark:bg-white/8 backdrop-blur-lg border border-white/20 dark:border-white/15 overflow-hidden flex-shrink-0 ring-2 ring-white/5">
                        {comment.user?.avatar_url ? (
                          <Image
                            src={comment.user.avatar_url}
                            alt={comment.user.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 dark:bg-white/5 flex items-center justify-center text-black dark:text-white text-xs font-semibold">
                            {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 bg-white/8 dark:bg-white/5 backdrop-blur-lg rounded-2xl px-3 sm:px-4 py-2 border border-white/15 dark:border-white/10 transition-all duration-300 group-hover/comment:bg-white/12 dark:group-hover/comment:bg-white/8">
                        <p className="text-xs sm:text-sm">
                          <span className="font-semibold text-black dark:text-white">
                            {comment.user?.name}
                          </span>{" "}
                          <span className="text-black/75 dark:text-white/75">{comment.content}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-black/60 dark:text-white/60 text-xs sm:text-sm">
                  No comments yet
                </p>
              )}

              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl sm:rounded-[24px] bg-white/8 dark:bg-white/5 backdrop-blur-xl saturate-110 border border-white/25 dark:border-white/15 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-white/35 dark:focus:border-white/25 text-xs sm:text-sm transition-all duration-300 hover:bg-white/12 dark:hover:bg-white/8"
                />
                <button
                  type="submit"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/12 dark:bg-white/8 backdrop-blur-xl saturate-110 border border-white/30 dark:border-white/20 flex items-center justify-center text-black dark:text-white font-semibold hover:bg-white/18 dark:hover:bg-white/12 active:scale-95 transition-all duration-300 touch-target hover:ring-2 hover:ring-white/30 dark:hover:ring-white/20"
                  title="Post comment"
                >
                  <span className="text-sm sm:text-base">✓</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
