"use client";

import { useState, useEffect } from "react";
import { Post } from "@/types";
import Image from "next/image";
import { FiX, FiHeart, FiMessageCircle, FiShare2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

interface PostModalProps {
  post: Post | null;
  posts: Post[];
  onClose: () => void;
  onNavigate?: (post: Post) => void;
}

export default function PostModal({ post, posts, onClose, onNavigate }: PostModalProps) {
  const [isLiked, setIsLiked] = useState(post?.is_liked || false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!post) return;

    const currentIndex = posts.findIndex((p) => p.id === post.id);
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex < posts.length - 1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && canGoPrev) {
        if (currentIndex > 0) {
          onNavigate?.(posts[currentIndex - 1]);
        }
      }
      if (e.key === "ArrowRight" && canGoNext) {
        if (currentIndex < posts.length - 1) {
          onNavigate?.(posts[currentIndex + 1]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [post, posts, onClose, onNavigate]);

  if (!post) return null;

  const currentIndex = posts.findIndex((p) => p.id === post.id);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < posts.length - 1;

  const handlePrevious = () => {
    if (canGoPrev) {
      const prevPost = posts[currentIndex - 1];
      onNavigate?.(prevPost);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      const nextPost = posts[currentIndex + 1];
      onNavigate?.(nextPost);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl bg-white/5 dark:bg-black/40 border border-white/10 dark:border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-strong flex items-center justify-center hover:bg-white/20 dark:hover:bg-black/40 transition-all text-black dark:text-white"
          aria-label="Close modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Navigation arrows */}
        {canGoPrev && (
          <button
            onClick={handlePrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-strong flex items-center justify-center hover:bg-white/20 dark:hover:bg-black/40 transition-all text-black dark:text-white"
            title="Previous post (←)"
            aria-label="Previous post"
          >
            <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {canGoNext && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-strong flex items-center justify-center hover:bg-white/20 dark:hover:bg-black/40 transition-all text-black dark:text-white"
            title="Next post (→)"
            aria-label="Next post"
          >
            <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-h-[85vh] overflow-hidden">
          {/* Media Section */}
          <div className="md:col-span-2 bg-black flex items-center justify-center min-h-60 sm:min-h-80 md:min-h-full overflow-auto">
            {post.type === "photo" ? (
              <img
                src={post.media_url}
                alt={post.caption || "Post"}
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={post.media_url}
                controls
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col bg-white/5 dark:bg-black/30 border-l border-white/10 dark:border-white/10">
            {/* User Info */}
            <div className="p-4 border-b border-white/10 dark:border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/15 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-black dark:text-white text-xs font-bold flex-shrink-0">
                {post.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-black dark:text-white truncate">
                  {post.user?.name}
                </p>
                <p className="text-xs text-black/60 dark:text-white/60 truncate">
                  {post.user?.school}
                </p>
              </div>
            </div>

            {/* Caption Section */}
            <div className="flex-1 overflow-y-auto p-4 border-b border-white/10 dark:border-white/10">
              {post.caption ? (
                <p className="text-sm text-black/80 dark:text-white/80 leading-relaxed whitespace-pre-wrap">
                  {post.caption}
                </p>
              ) : (
                <p className="text-sm text-black/40 dark:text-white/40 italic">No caption</p>
              )}
            </div>

            {/* Stats */}
            <div className="px-4 py-3 border-b border-white/10 dark:border-white/10 flex gap-6 text-sm">
              <div>
                <p className="text-black/60 dark:text-white/60 text-xs">Likes</p>
                <p className="text-base font-bold text-black dark:text-white">{likesCount}</p>
              </div>
              <div>
                <p className="text-black/60 dark:text-white/60 text-xs">Comments</p>
                <p className="text-base font-bold text-black dark:text-white">
                  {post.comments_count || 0}
                </p>
              </div>
              <div className="ml-auto">
                <p className="text-black/60 dark:text-white/60 text-xs">Posted</p>
                <p className="text-xs font-medium text-black dark:text-white">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                    isLiked
                      ? "glass-strong bg-white/15 dark:bg-black/50 text-black dark:text-white"
                      : "bg-white/10 dark:bg-black/30 text-black dark:text-white hover:bg-white/15 dark:hover:bg-black/40"
                  }`}
                >
                  <FiHeart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  Like
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/10 dark:bg-black/30 hover:bg-white/15 dark:hover:bg-black/40 transition-all text-black dark:text-white text-sm font-medium"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  Reply
                </button>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/10 dark:bg-black/30 hover:bg-white/15 dark:hover:bg-black/40 transition-all text-black dark:text-white text-sm font-medium">
                <FiShare2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Navigation Info */}
            {posts.length > 1 && (
              <div className="px-4 py-2 text-center text-xs text-black/50 dark:text-white/50 border-t border-white/10 dark:border-white/10">
                {currentIndex + 1} of {posts.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
