"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Post } from "@/types";
import { FiSettings, FiUserPlus, FiUserCheck } from "react-icons/fi";
import Image from "next/image";
import PostCard from "@/components/feed/PostCard";
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
  const [isFriend, setIsFriend] = useState(false);
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
  }, [userId]);

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
        setIsFriend(true);
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
      <div className="flex items-center justify-center h-screen">
        <div className="glass-strong rounded-2xl p-8">
          <p className="text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-strong rounded-2xl p-8">
          <p className="text-white/70">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <header className="glass-strong rounded-b-3xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Profile
          </h1>
          {isOwnProfile && (
            <div className="flex items-center gap-2">
              <button className="text-white/80 hover:text-white">
                <FiSettings className="text-2xl" />
              </button>
              <LogoutButton />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
          <p className="text-white/70 mb-4">{user.school}</p>
          {user.bio && (
            <p className="text-white/80 text-center mb-4">{user.bio}</p>
          )}

          {!isOwnProfile && (
            <button
              onClick={handleFriendRequest}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                friendshipStatus === "accepted"
                  ? "bg-white/10 text-white"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
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
                  Add Friend
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Posts Grid */}
      <div className="px-4">
        <h3 className="text-xl font-semibold text-white mb-4">Posts</h3>
        {posts.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <p className="text-white/70">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

