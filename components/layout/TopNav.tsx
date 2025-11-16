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
    <nav className="fixed top-3 sm:top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-auto max-w-xs sm:max-w-md lg:max-w-2xl">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 200,
        }}
        className="h-12 sm:h-14 md:h-16 px-3 sm:px-4 md:px-6 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-[100px] saturate-[200%] border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-1.5 sm:gap-2 md:gap-3 overflow-hidden"
      >
        {/* Logo/Title */}
        <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-black dark:text-white mr-1 sm:mr-2 md:mr-4 lg:mr-6 flex-shrink-0 truncate">
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
                className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 touch-target flex-shrink-0 ${
                  isActive
                    ? "bg-white/15 dark:bg-black/50 backdrop-blur-[80px] saturate-[180%] border border-white/25 dark:border-white/20"
                    : "bg-white/5 dark:bg-black/30 backdrop-blur-[80px] saturate-[180%] border border-white/18 dark:border-white/10 hover:bg-white/10 dark:hover:bg-black/40"
                }`}
              >
                <Icon 
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
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
        <div className="w-px h-6 sm:h-8 bg-white/20 dark:bg-white/10 mx-1 flex-shrink-0" />

        {/* Create Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.1 }}
          onClick={handleCreate}
          className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-[80px] saturate-[180%] border border-white/18 dark:border-white/10 flex items-center justify-center hover:bg-white/10 dark:hover:bg-black/40 transition-all duration-300 touch-target flex-shrink-0"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 transition-all" />
        </motion.button>

        {/* Search Button - Compact */}
        <div className="ml-1">
          <SearchBar compact={true} />
        </div>
      </motion.div>
    </nav>
  );
}

