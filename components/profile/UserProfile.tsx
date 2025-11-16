"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Post } from "@/types";
import { FiUserPlus, FiUserCheck } from "react-icons/fi";
import Image from "next/image";
import PostGrid from "./PostGrid";
import LogoutButton from "./LogoutButton";

interface UserProfileProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function UserProfile({
  userId,
  isOwnProfile = false,
}: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<
    "none" | "pending" | "accepted"
  >("none");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
    if (!isOwnProfile) {
      checkFriendship();
    }
  }, [userId, isOwnProfile]);

  const loadProfile = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) throw userError;
      if (userData) setUser(userData);

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:users(id, name, avatar_url, school)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      if (postsData) {
        const transformedPosts = postsData.map((post: any) => ({
          ...post,
          user: post.user,
          is_liked: false,
        }));
        setPosts(transformedPosts);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendship = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) return;

    const { data } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(user_id.eq.${currentUser.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUser.id})`
      )
      .single();

    if (data) {
      if (data.status === "accepted") {
        setFriendshipStatus("accepted");
      } else {
        setFriendshipStatus("pending");
      }
    }
  };

  const handleFriendRequest = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) return;

    if (friendshipStatus === "none") {
      const { error } = await supabase.from("friendships").insert({
        user_id: currentUser.id,
        friend_id: userId,
        status: "pending",
      });

      if (!error) {
        setFriendshipStatus("pending");
      }
    } else if (friendshipStatus === "pending") {
      // Cancel request
      const { error } = await supabase
        .from("friendships")
        .delete()
        .or(
          `and(user_id.eq.${currentUser.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUser.id})`
        );

      if (!error) {
        setFriendshipStatus("none");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/70 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/70 text-lg">User not found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Profile Header - Instagram Style */}
      <div className="border-b border-white/10 pb-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Avatar */}
          <div className="flex justify-center sm:justify-start flex-shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/15 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-black dark:text-white text-5xl sm:text-6xl font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            {/* Name & Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                {user.name}
              </h1>
              {!isOwnProfile ? (
                <button
                  onClick={handleFriendRequest}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    friendshipStatus === "accepted"
                      ? "glass-strong text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/40"
                      : "glass-strong text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/40"
                  }`}
                >
                  {friendshipStatus === "accepted" ? (
                    <>
                      <FiUserCheck className="inline mr-2" />
                      Friends
                    </>
                  ) : friendshipStatus === "pending" ? (
                    "Pending"
                  ) : (
                    <>
                      <FiUserPlus className="inline mr-2" />
                      Follow
                    </>
                  )}
                </button>
              ) : (
                <LogoutButton />
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 sm:gap-12 mb-6">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                  {posts.length}
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">Posts</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                  0
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">Followers</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                  0
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">Following</p>
              </div>
            </div>

            {/* Bio & School */}
            <div>
              <p className="text-white font-semibold mb-1">{user.school}</p>
              {user.bio && (
                <p className="text-white/80 text-sm leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wide text-white/60">
          Posts
        </h2>
        <PostGrid posts={posts} />
      </div>
    </div>
  );
}

