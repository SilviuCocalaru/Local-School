"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import VideoCard from "@/components/videos/VideoCard";
import { Post } from "@/types";

export default function VideoFeed() {
  const [videos, setVideos] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:users(id, name, avatar_url, school)
        `
        )
        .eq("type", "video")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const transformedVideos = (data || []).map((video: any) => ({
        ...video,
        user: video.user,
        is_liked: false,
      }));

      setVideos(transformedVideos);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up" && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-strong rounded-2xl p-8">
          <p className="text-white/70">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <p className="text-white/70 text-lg mb-2">No videos yet</p>
          <p className="text-white/50 text-sm">
            Be the first to share a video!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <VideoCard
        video={videos[currentIndex]}
        onSwipe={handleSwipe}
        isActive={true}
      />
    </div>
  );
}

