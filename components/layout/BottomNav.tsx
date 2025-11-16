"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiVideo, FiMessageCircle, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const navItems = [
  { href: "/feed", icon: FiHome, label: "Home" },
  { href: "/videos", icon: FiVideo, label: "Videos" },
  { href: "/chat", icon: FiMessageCircle, label: "Chat" },
  { href: "/profile", icon: FiUser, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-md sm:max-w-lg md:max-w-2xl w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)]">
      <div className="pointer-events-auto">
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 200,
            delay: 0.1
          }}
          className="h-16 sm:h-20 px-2 sm:px-4 rounded-[32px] sm:rounded-[40px] bg-white/5 backdrop-blur-[100px] saturate-[200%] brightness-[1.1] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex items-center justify-center gap-1 sm:gap-2"
        >
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
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_8px_24px_rgba(59,130,246,0.5)]"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  />
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: isActive ? 1 : 1.05 }}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 touch-target ${
                    isActive
                      ? ""
                      : "bg-white/5 backdrop-blur-[80px] saturate-[200%] border border-white/15 hover:bg-white/10"
                  }`}
                >
                  <Icon 
                    className={`w-5 h-5 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 transition-all duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-white/80"
                    }`} 
                  />
                  <span 
                    className={`text-[9px] sm:text-[10px] font-medium transition-all duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-white/70"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </nav>
  );
}

