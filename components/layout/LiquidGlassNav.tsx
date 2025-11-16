"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiHome, FiVideo, FiMessageCircle, FiUser, FiBell } from "react-icons/fi";
import UserSearch from "@/components/search/UserSearch";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

interface BubbleStyle {
  left: number;
  width: number;
}

const LiquidGlassNav = React.memo(() => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [bubbleStyle, setBubbleStyle] = useState<BubbleStyle>({ left: 0, width: 48 });
  const [isVisible, setIsVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const CONTAINER_PADDING = 8;
  const BUTTON_WIDTH = 56;
  const BUBBLE_WIDTH = 48;
  const GAP = 16;

  // Static labels instead of i18n to avoid SSG context issues
  const navItems = [
    { icon: FiHome, label: "Home", path: "/feed" },
    { icon: FiVideo, label: "Videos", path: "/videos" },
    { icon: FiMessageCircle, label: "Messages", path: "/chat" },
    { icon: FiUser, label: "Profile", path: "/profile" },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculatePosition = (tabIndex: number): { left: number } => {
    const targetButtonLeft = CONTAINER_PADDING + tabIndex * (BUTTON_WIDTH + GAP);
    const targetLeft = targetButtonLeft + BUTTON_WIDTH / 2 - BUBBLE_WIDTH / 2;
    return { left: targetLeft };
  };

  useEffect(() => {
    const initialPos = calculatePosition(0);
    setBubbleStyle({ left: initialPos.left, width: BUBBLE_WIDTH });
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  useEffect(() => {
    if (pathname?.includes("/feed") || pathname === "/") {
      setActiveTab(0);
    } else if (pathname?.includes("/videos")) {
      setActiveTab(1);
    } else if (pathname?.includes("/chat")) {
      setActiveTab(2);
    } else if (pathname?.includes("/profile")) {
      setActiveTab(3);
    }
  }, [pathname]);

  useEffect(() => {
    const newPos = calculatePosition(activeTab);
    setBubbleStyle({ left: newPos.left, width: BUBBLE_WIDTH });
  }, [activeTab]);

  const handleTabClick = (index: number, path: string) => {
    setActiveTab(index);
    router.push(path);
  };

  const isAuthPage = pathname?.includes("/auth") || pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  if (!isMounted) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-end px-4 pb-safe pointer-events-none"
      style={{ maxHeight: "120px" }}
    >
      {/* Navigation container - smaller, optimized */}
      <div 
        className="relative p-2 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg mb-4 will-change-transform flex items-center gap-2 pointer-events-auto" 
        style={{ maxWidth: "fit-content" }}
      >
        {/* Top toolbar - Search, Notifications, Language */}
        <div className="flex items-center gap-1 px-2 border-r border-white/10 dark:border-white/5">
          <UserSearch />
          <button
            className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-full transition-colors relative"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          <LanguageSwitcher />
        </div>

        {/* Animated bubble - GPU accelerated */}
        <div
          style={{
            position: "absolute",
            left: `${bubbleStyle.left}px`,
            width: `${bubbleStyle.width}px`,
            height: "56px",
            borderRadius: "9999px",
            top: "8px",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 0,
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            willChange: "transform, width",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200/25 via-purple-300/15 to-pink-200/20 backdrop-blur-xl border border-purple-200/30" />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
              clipPath: "ellipse(40% 35% at 30% 30%)",
            }}
          />
        </div>

        {/* Navigation buttons */}
        <div className="relative z-10 flex items-center gap-4 pl-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeTab;

            return (
              <button
                key={index}
                onClick={() => handleTabClick(index, item.path)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  isActive ? "text-red-500" : "text-white/50 hover:text-white/80"
                }`}
                aria-label={item.label}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </nav>
  );
});

LiquidGlassNav.displayName = "LiquidGlassNav";

export default LiquidGlassNav;
