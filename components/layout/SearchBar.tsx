"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { FiSearch, FiX, FiUserPlus, FiMessageCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/types";
import Image from "next/image";

interface SearchBarProps {
  compact?: boolean;
}

export default function SearchBar({ compact = false }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setSearchQuery("");
        setResults([]);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .neq("id", currentUserId || "")
          .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,school.ilike.%${searchQuery}%`)
          .limit(20);

        if (!error && data) {
          setResults(data);
        }
      } catch (error) {
        // Search error handled silently
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUserId]);

  const handleAddFriend = async (userId: string) => {
    if (!currentUserId) return;

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from("friendships")
      .select("*")
      .or(`and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`)
      .maybeSingle();

    if (existing) return; // Already friends or pending

    // Create friendship request
    await supabase.from("friendships").insert({
      user_id: currentUserId,
      friend_id: userId,
      status: "pending",
    });
  };

  return (
    <div ref={searchRef} className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-[80px] saturate-[180%] border border-white/18 dark:border-white/10 flex items-center justify-center hover:bg-white/10 dark:hover:bg-black/40 transition-all duration-300 touch-target ${
          isExpanded ? "w-full h-10 sm:h-11 md:h-12 px-3 sm:px-4" : compact ? "w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12" : "w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12"
        }`}
      >
        <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-black/70 dark:text-white/70 flex-shrink-0" />
        {isExpanded && (
          <motion.input
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 text-sm"
            autoFocus
          />
        )}
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery("");
              setResults([]);
            }}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          >
            <FiX className="text-lg" />
          </motion.button>
        )}
      </motion.button>

      <AnimatePresence>
        {isExpanded && (searchQuery.trim() || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl sm:rounded-2xl md:rounded-3xl bg-white/5 dark:bg-black/30 backdrop-blur-[100px] saturate-[200%] border border-white/20 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto z-50"
          >
            {loading ? (
              <div className="p-4 text-center text-black/60 dark:text-white/60">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-white/5 dark:hover:bg-black/20 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 dark:bg-black/40 backdrop-blur-[60px] border border-white/20 dark:border-white/10 overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 dark:bg-black/40 flex items-center justify-center text-black dark:text-white font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-black dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-black/60 dark:text-white/60 truncate">
                        {user.school}
                      </p>
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleAddFriend(user.id)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 dark:bg-black/40 backdrop-blur-[80px] saturate-[180%] border border-white/20 dark:border-white/15 flex items-center justify-center text-black dark:text-white hover:bg-white/15 dark:hover:bg-black/50 transition-all touch-target"
                        title="Add Friend"
                      >
                        <FiUserPlus className="text-xs sm:text-sm" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => window.location.href = `/chat/${user.id}`}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-[80px] saturate-[180%] border border-white/18 dark:border-white/10 flex items-center justify-center text-black/70 dark:text-white/70 hover:bg-white/10 dark:hover:bg-black/40 active:scale-95 transition-all touch-target"
                        title="Message"
                      >
                        <FiMessageCircle className="text-xs sm:text-sm" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center text-black/60 dark:text-white/60">
                No users found
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
