"use client";

import { useState } from "react";
import { Post } from "@/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiHeart, FiMessageCircle, FiShare2 } from "react-icons/fi";

interface PostGridProps {
  posts: Post[];
}

export default function PostGrid({ posts }: PostGridProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-white/70 text-lg">No posts yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
        {posts.map((post) => (
          <motion.button
            key={post.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPost(post)}
            className="relative aspect-square overflow-hidden rounded-lg bg-white/5 border border-white/10 cursor-pointer group"
          >
            {post.type === "photo" ? (
              <img
                src={post.media_url}
                alt="Post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <>
                <video
                  src={post.media_url}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg
                      className="w-6 h-6 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </>
            )}

            {/* Hover overlay with interaction count */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-2 text-white">
                <FiHeart className="w-5 h-5" />
                <span className="text-sm font-semibold">{post.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <FiMessageCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  {post.comments_count || 0}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-black/90 border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Media */}
                <div className="md:col-span-2 bg-black flex items-center justify-center min-h-96 md:min-h-full">
                  {selectedPost.type === "photo" ? (
                    <img
                      src={selectedPost.media_url}
                      alt="Post"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={selectedPost.media_url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col bg-white/5 border-l border-white/10">
                  {/* User info */}
                  <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/15 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-black dark:text-white text-xs font-bold flex-shrink-0">
                      {selectedPost.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-black dark:text-white truncate">
                        {selectedPost.user?.name}
                      </p>
                      <p className="text-xs text-black/60 dark:text-white/60 truncate">
                        {selectedPost.user?.school}
                      </p>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {selectedPost.caption ? (
                      <p className="text-sm text-white/80 leading-relaxed">
                        {selectedPost.caption}
                      </p>
                    ) : (
                      <p className="text-sm text-white/40 italic">No caption</p>
                    )}
                  </div>

                  {/* Stats & Actions */}
                  <div className="border-t border-white/10 p-4 space-y-4">
                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-white/60">Likes</p>
                        <p className="text-lg font-bold text-white">
                          {selectedPost.likes_count || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60">Comments</p>
                        <p className="text-lg font-bold text-white">
                          {selectedPost.comments_count || 0}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white text-sm font-medium">
                        <FiHeart className="w-4 h-4" />
                        Like
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white text-sm font-medium">
                        <FiMessageCircle className="w-4 h-4" />
                        Reply
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white text-sm font-medium">
                        <FiShare2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
