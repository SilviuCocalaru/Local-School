"use client";

import { useState } from "react";
import { Post } from "@/types";
import Image from "next/image";
import { FiHeart, FiMessageCircle } from "react-icons/fi";
import PostModal from "./PostModal";

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2 md:gap-3 lg:gap-4">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="relative aspect-square overflow-hidden rounded-lg bg-white/5 border border-white/10 cursor-pointer group hover:scale-105 transition-transform duration-300 active:scale-95 min-h-[80px] sm:min-h-[120px]"
            aria-label={`View post by ${post.user?.name || 'Unknown'}`}
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
          </button>
        ))}
      </div>

      <PostModal
        post={selectedPost}
        posts={posts}
        onClose={() => setSelectedPost(null)}
        onNavigate={setSelectedPost}
      />
    </>
  );
}
