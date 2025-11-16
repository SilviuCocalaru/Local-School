"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PostCard from "@/components/feed/PostCard";
import { Post } from "@/types";

export default function PhotoFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:users(id, name, avatar_url, school)
        `
        )
        .eq("type", "photo")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform data to match Post type
      const transformedPosts = (data || []).map((post: any) => ({
        ...post,
        user: post.user,
        is_liked: false, // Will be updated with user's like status
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mx-0 sm:mx-4 md:mx-6 rounded-[24px] sm:rounded-[32px] bg-white/5 backdrop-blur-[100px] saturate-[200%] brightness-[1.1] border border-white/20 p-4 animate-pulse"
          >
            <div className="h-96 bg-white/10 rounded-3xl mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-[24px] sm:rounded-[32px] bg-white/5 backdrop-blur-[100px] saturate-[200%] brightness-[1.1] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6 sm:p-8 text-center">
          <p className="text-white text-base sm:text-lg mb-2 font-semibold">No posts yet</p>
          <p className="text-white/60 text-xs sm:text-sm">
            Be the first to share something!
          </p>
        </div>
      </div>
    );
  }

  const handleDeletePost = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
      ))}
    </div>
  );
}

