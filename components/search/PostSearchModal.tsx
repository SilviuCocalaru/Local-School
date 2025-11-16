"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { FiSearch, FiX, FiTrash2, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Post, User } from "@/types";
import Image from "next/image";

interface PostSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost?: (post: Post) => void;
}

export default function PostSearchModal({
  isOpen,
  onClose,
  onSelectPost,
}: PostSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        // Invalid JSON, skip
      }
    }
  }, []);

  // Load all posts once
  useEffect(() => {
    const loadAllPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(
            `
            *,
            user:users(id, name, avatar_url, school)
          `
          )
          .order("created_at", { ascending: false })
          .limit(100);

        if (!error && data) {
          setAllPosts(data);
        }
      } catch (error) {
        // Error handled silently
      }
    };

    if (isOpen && allPosts.length === 0) {
      loadAllPosts();
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Filter posts in real-time
  const filterPosts = useCallback((query: string): Post[] => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();

    return allPosts.filter((post) => {
      const caption = (post.caption || "").toLowerCase();
      const username = (post.user?.name || "").toLowerCase();
      const school = (post.user?.school || "").toLowerCase();

      // Search in caption, username, and extract hashtags
      const captionMatch = caption.includes(lowerQuery);
      const usernameMatch = username.includes(lowerQuery);
      const schoolMatch = school.includes(lowerQuery);

      // Extract hashtags from caption and search them
      const hashtagMatch =
        caption.match(/#\w+/g)?.some((tag) =>
          tag.toLowerCase().includes(lowerQuery.replace("#", ""))
        ) || false;

      return captionMatch || usernameMatch || schoolMatch || hashtagMatch;
    });
  }, [allPosts]);

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const debounceTimer = setTimeout(() => {
      const filtered = filterPosts(searchQuery);
      setResults(filtered);
      setLoading(false);
    }, 150); // Light debounce for real-time feel

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filterPosts]);

  // Handle search submission
  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    // Add to history (keep last 5 unique searches)
    const newHistory = [
      query,
      ...searchHistory.filter((item) => item !== query),
    ].slice(0, 5);

    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    setSearchQuery(query);
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // Handle post click
  const handlePostClick = (post: Post) => {
    if (onSelectPost) {
      onSelectPost(post);
    }
    // Optionally close modal
    // onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-x-0 top-0 sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl mx-4 sm:mx-0 z-50"
          >
            <div className="rounded-2xl sm:rounded-3xl bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <FiSearch className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search posts, users, hashtags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch(searchQuery);
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/50 text-base"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <FiX className="w-5 h-5 text-white/70" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                {/* Loading state */}
                {loading && searchQuery.trim() && (
                  <div className="p-6 sm:p-8 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white/30 animate-pulse" />
                      <span className="text-white/60 text-sm">Searching...</span>
                    </div>
                  </div>
                )}

                {/* Results */}
                {!loading && searchQuery.trim() && results.length > 0 && (
                  <div className="divide-y divide-white/5">
                    {results.map((post) => (
                      <motion.div
                        key={post.id}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                        onClick={() => handlePostClick(post)}
                        className="p-4 sm:p-5 cursor-pointer transition-colors"
                      >
                        {/* Post preview */}
                        <div className="flex gap-3 sm:gap-4">
                          {/* User avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                              {post.user?.avatar_url ? (
                                <Image
                                  src={post.user.avatar_url}
                                  alt={post.user.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                                  {post.user?.name?.charAt(0).toUpperCase() ||
                                    "U"}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Post info */}
                          <div className="flex-1 min-w-0">
                            {/* User info */}
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white text-sm sm:text-base truncate">
                                {post.user?.name || "Unknown"}
                              </p>
                              <span className="text-white/50 text-xs">
                                @{post.user?.school || "unknown"}
                              </span>
                            </div>

                            {/* Caption preview */}
                            {post.caption && (
                              <p className="text-white/70 text-sm mt-1 line-clamp-2">
                                {post.caption}
                              </p>
                            )}

                            {/* Hashtags */}
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {(post.caption?.match(/#\w+/g) || [])
                                .slice(0, 3)
                                .map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 mt-2 text-xs text-white/50">
                              <span>❤️ {post.likes_count || 0}</span>
                              {post.comments_count && (
                                <span>💬 {post.comments_count}</span>
                              )}
                            </div>
                          </div>

                          {/* Post thumbnail */}
                          {post.media_url && (
                            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                              <Image
                                src={post.media_url}
                                alt="Post"
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* No results state */}
                {!loading && searchQuery.trim() && results.length === 0 && (
                  <div className="p-8 sm:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 mb-4">
                      <FiSearch className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
                    </div>
                    <p className="text-white font-medium mb-1">No results found</p>
                    <p className="text-white/50 text-sm">
                      Try searching for different keywords or hashtags
                    </p>
                  </div>
                )}

                {/* Search history */}
                {!searchQuery.trim() && searchHistory.length > 0 && (
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-white/70">
                        <FiClock className="w-4 h-4" />
                        <span className="text-sm font-medium">Recent searches</span>
                      </div>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-white/50 hover:text-white/70 transition-colors flex items-center gap-1"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((query, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSearch(query)}
                          className="px-3 py-1 sm:py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white/80 text-xs sm:text-sm transition-all"
                        >
                          {query}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state (no query, no history) */}
                {!searchQuery.trim() && searchHistory.length === 0 && (
                  <div className="p-8 sm:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 mb-4">
                      <FiSearch className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
                    </div>
                    <p className="text-white/70 text-sm">
                      Search posts by content, username, or hashtags
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
