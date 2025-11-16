"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FiSearch, FiX, FiMessageCircle } from "react-icons/fi";

interface UserSearchResult {
  id: string;
  username: string;
  full_name: string;
  profile_picture: string | null;
}

export default function UserSearch() {
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, profile_picture")
        .ilike("username", `%${query}%`)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (userId: string) => {
    try {
      // Create or get existing chat
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: chatData } = await supabase
        .from("chats")
        .select("id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .single();

      if (chatData) {
        router.push(`/chat/${userId}`);
      } else {
        // Create new chat
        const { data: newChat } = await supabase
          .from("chats")
          .insert({
            user1_id: user.id,
            user2_id: userId,
          })
          .select("id")
          .single();

        if (newChat) {
          router.push(`/chat/${userId}`);
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-full transition-colors"
        aria-label="Search"
      >
        <FiSearch className="w-5 h-5" />
      </button>

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16">
          <div className="card-glass w-full max-w-2xl rounded-3xl shadow-depth-lg">
            {/* Search Input */}
            <div className="p-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <FiSearch className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  autoFocus
                  className="flex-1 bg-transparent text-foreground placeholder-gray-500 outline-none"
                />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                    setResults([]);
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="p-6 text-center text-gray-500">
                  Loading...
                </div>
              )}

              {!loading && results.length === 0 && query.trim().length > 0 && (
                <div className="p-6 text-center text-gray-500">
                  No results found
                </div>
              )}

              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-white/10 dark:hover:bg-white/5 border-b border-white/5 dark:border-white/2 transition-colors"
                >
                  <div
                    onClick={() => {
                      router.push(`/profile?userId=${user.id}`);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    {user.profile_picture && (
                      <img
                        src={user.profile_picture}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMessageClick(user.id)}
                    className="p-2 hover:bg-blue-500/20 rounded-full transition-colors text-blue-500"
                    aria-label="Send message"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
