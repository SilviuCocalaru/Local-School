"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiHome, FiVideo, FiMessageCircle, FiUser } from "react-icons/fi";

interface BubbleStyle {
  left: number;
  width: number;
}

const navItems = [
  { icon: FiHome, label: "Home", path: "/feed" },
  { icon: FiVideo, label: "Videos", path: "/videos" },
  { icon: FiMessageCircle, label: "Chat", path: "/chat" },
  { icon: FiUser, label: "Profile", path: "/profile" },
];

const CONTAINER_PADDING = 8;
const BUTTON_WIDTH = 56;
const BUBBLE_WIDTH = 48;
const GAP = 16;

const LiquidGlassNav = React.memo(() => {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState(0);
  const [bubbleStyle, setBubbleStyle] = useState<BubbleStyle>({ left: 0, width: BUBBLE_WIDTH });
  const [isVisible, setIsVisible] = useState(false);

  // Check if on auth page
  const isAuthPage = pathname?.includes("/auth") || pathname === "/login" || pathname === "/signup";

  // Calculate position for a given tab index
  const calculatePosition = (tabIndex: number): { left: number } => {
    const targetButtonLeft = CONTAINER_PADDING + tabIndex * (BUTTON_WIDTH + GAP);
    const targetLeft = targetButtonLeft + BUTTON_WIDTH / 2 - BUBBLE_WIDTH / 2;
    return { left: targetLeft };
  };

  // Initialize and entrance animation
  useEffect(() => {
    const initialPos = calculatePosition(0);
    setBubbleStyle({ left: initialPos.left, width: BUBBLE_WIDTH });
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  // Sync active tab with current URL
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

  // Handle tab change with simplified CSS-only animation
  useEffect(() => {
    const newPos = calculatePosition(activeTab);
    setBubbleStyle({ left: newPos.left, width: BUBBLE_WIDTH });
  }, [activeTab]);

  const handleTabClick = (index: number, path: string) => {
    setActiveTab(index);
    router.push(path);
  };

  if (isAuthPage) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 flex justify-center items-end px-4 pb-safe transition-transform duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Navigation container - smaller, optimized */}
      <div
        className="relative p-2 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm mb-6 will-change-transform"
        style={{ maxWidth: "calc(100vw - 32px)" }}
      >
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
          {/* Main glass layer only - minimal layers */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200/25 via-purple-300/15 to-pink-200/20 backdrop-blur-xl border border-purple-200/30" />

          {/* Subtle top highlight */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
              clipPath: "ellipse(40% 35% at 30% 30%)",
            }}
          />
        </div>

        {/* Navigation buttons */}
        <div className="relative z-10 flex items-center gap-4">
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

      {/* Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
});

LiquidGlassNav.displayName = "LiquidGlassNav";

export default LiquidGlassNav;
