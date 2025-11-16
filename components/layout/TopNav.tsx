"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiVideo, FiMessageCircle, FiUser, FiPlus, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";

const navItems = [
  { href: "/feed", icon: FiHome, label: "Home" },
  { href: "/videos", icon: FiVideo, label: "Videos" },
  { href: "/chat", icon: FiMessageCircle, label: "Chat" },
  { href: "/profile", icon: FiUser, label: "Profile" },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = usePathname();

  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleCreate = () => {
    hapticFeedback();
    window.location.href = "/create";
  };

  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-2xl">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 200,
        }}
        className="h-14 sm:h-16 px-4 sm:px-6 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-[100px] saturate-[200%] border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-2 sm:gap-3"
      >
        {/* Logo/Title */}
        <h1 className="text-base sm:text-lg font-bold text-black dark:text-white mr-2 sm:mr-6">
          {pathname === "/feed" ? "Feed" : pathname === "/videos" ? "Videos" : pathname === "/chat" ? "Messages" : "Profile"}
        </h1>

        {/* Navigation Buttons */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={hapticFeedback}
              className="relative"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 touch-target ${
                  isActive
                    ? "bg-white/15 dark:bg-black/50 backdrop-blur-[80px] saturate-[180%] border border-white/25 dark:border-white/20"
                    : "bg-white/5 dark:bg-black/30 backdrop-blur-[80px] saturate-[180%] border border-white/18 dark:border-white/10 hover:bg-white/10 dark:hover:bg-black/40"
                }`}
              >
                <Icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? "text-black dark:text-white"
                      : "text-black/70 dark:text-white/70"
                  }`} 
                />
              </motion.button>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="w-px h-8 bg-white/20 dark:bg-white/10 mx-1 sm:mx-2" />

        {/* Create Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.1 }}
          onClick={handleCreate}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-[80px] saturate-[180%] border border-white/18 dark:border-white/10 flex items-center justify-center hover:bg-white/10 dark:hover:bg-black/40 transition-all duration-300 touch-target"
        >
          <FiPlus className="w-5 h-5 sm:w-6 sm:h-6 text-black/70 dark:text-white/70" />
        </motion.button>

        {/* Search Button - Compact */}
        <div className="ml-1 sm:ml-2">
          <SearchBar compact={true} />
        </div>
      </motion.div>
    </nav>
  );
}

