"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types";
import { FiHeart, FiMessageCircle, FiShare2, FiPlay, FiPause } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

interface VideoCardProps {
  video: Post;
  onSwipe: (direction: "up" | "down") => void;
  isActive: boolean;
}

export default function VideoCard({ video, onSwipe, isActive }: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes_count || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    checkLikeStatus();
  }, [video.id]);

  const checkLikeStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", video.id)
      .eq("user_id", user.id)
      .single();

    setIsLiked(!!data);
  };

  const handleLike = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", video.id)
        .eq("user_id", user.id);
      setLikesCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      await supabase.from("likes").insert({
        post_id: video.id,
        user_id: user.id,
      });
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe) {
      onSwipe("up");
    } else if (isDownSwipe) {
      onSwipe("down");
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        src={video.media_url}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={false}
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 floating-island-lg floating-island-hover pointer-events-auto">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/15 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-black dark:text-white font-semibold">
              {video.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-white">{video.user?.name}</p>
              <p className="text-xs text-white/70">
                {formatDistanceToNow(new Date(video.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {/* Caption */}
          {video.caption && (
            <p className="text-white mb-4 text-sm">{video.caption}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 pointer-events-auto">
            <button
              type="button"
              onClick={handleLike}
              className={`flex flex-col items-center gap-1 ${
                isLiked ? "text-red-500" : "text-white"
              } hover:opacity-80 active:scale-90 transition-all`}
              aria-label={isLiked ? "Unlike video" : "Like video"}
            >
              <FiHeart
                className={`text-3xl ${isLiked ? "fill-current" : ""}`}
              />
              <span className="text-xs font-medium">{likesCount}</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-white hover:opacity-80 active:scale-90 transition-all"
              aria-label="Comment on video"
            >
              <FiMessageCircle className="text-3xl" />
              <span className="text-xs font-medium">Comment</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-white hover:opacity-80 active:scale-90 transition-all"
              aria-label="Share video"
            >
              <FiShare2 className="text-3xl" />
              <span className="text-xs font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-strong rounded-full p-4 pointer-events-auto hover:scale-110 active:scale-95 transition-all"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? (
            <FiPause className="text-3xl text-white" />
          ) : (
            <FiPlay className="text-3xl text-white" />
          )}
        </button>
      </div>
    </div>
  );
}

