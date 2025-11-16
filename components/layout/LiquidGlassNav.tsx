"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiHome, FiVideo, FiMessageCircle, FiUser, FiBell, FiSearch } from "react-icons/fi";
import UserSearch from "@/components/search/UserSearch";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

interface BubbleStyle {
  left: number;
  width: number;
}

const LiquidGlassNav = React.memo(() => {
  const router = useRouter();
  const pathname = usePathname();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [bubbleStyle, setBubbleStyle] = useState<BubbleStyle>({ left: 0, width: 48 });
  const [isVisible, setIsVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Dynamic navigation items - easily extensible
  const navItems = [
    { icon: FiHome, label: "Home", path: "/feed" },
    { icon: FiSearch, label: "Search", path: "/search" },
    { icon: FiVideo, label: "Videos", path: "/videos" },
    { icon: FiMessageCircle, label: "Messages", path: "/chat" },
    { icon: FiUser, label: "Profile", path: "/profile" },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Dynamic bubble position calculator
   * Works with ANY number of navigation items
   * Calculates based on active button's actual position in DOM
   */
  const calculateBubblePosition = (tabIndex: number) => {
    const activeButton = buttonRefs.current[tabIndex];
    
    if (!activeButton || !navContainerRef.current) {
      return { left: 0, width: 48 };
    }

    // Get the button's position relative to its parent
    const buttonRect = activeButton.getBoundingClientRect();
    const containerRect = navContainerRef.current.getBoundingClientRect();
    
    // Calculate position relative to container
    const relativeLeft = buttonRect.left - containerRect.left;
    const buttonWidth = buttonRect.width;
    
    // Center the bubble under the button
    const bubbleWidth = 48;
    const bubbleLeft = relativeLeft + (buttonWidth - bubbleWidth) / 2;
    
    return {
      left: Math.max(0, bubbleLeft), // Prevent negative values
      width: bubbleWidth,
    };
  };

  // Initialize bubble position on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const initialPos = calculateBubblePosition(0);
      setBubbleStyle(initialPos);
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isMounted]);

  // Update bubble position when active tab changes
  useEffect(() => {
    const newPos = calculateBubblePosition(activeTab);
    setBubbleStyle(newPos);
  }, [activeTab]);

  // Detect active page from pathname (dynamic matching)
  useEffect(() => {
    const currentPath = pathname?.toLowerCase() || "";
    
    // Find matching nav item based on pathname
    const matchedIndex = navItems.findIndex((item) => {
      const itemPath = item.path.toLowerCase();
      return currentPath.includes(itemPath) || 
             (itemPath === "/feed" && (currentPath === "/" || currentPath === "/feed"));
    });

    // Only update if a match is found, otherwise keep current
    if (matchedIndex !== -1) {
      setActiveTab(matchedIndex);
    }
  }, [pathname]);

  // Recalculate bubble on window resize (responsive)
  useEffect(() => {
    const handleResize = () => {
      const newPos = calculateBubblePosition(activeTab);
      setBubbleStyle(newPos);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        ref={navContainerRef}
        className="relative p-2 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg mb-4 will-change-transform flex items-center gap-2 pointer-events-auto" 
        style={{ maxWidth: "fit-content" }}
      >
        {/* Top toolbar - Search, Notifications, Language */}
        <div className="flex items-center gap-1 px-2 border-r border-white/10 dark:border-white/5">
          <UserSearch />
          <button
            className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-full transition-colors relative pointer-events-auto"
            aria-label="Notifications"
            type="button"
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

        {/* Animated bubble - GPU accelerated, dynamically positioned */}
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
            willChange: "left, width",
            opacity: isVisible ? 1 : 0,
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

        {/* Navigation buttons - dynamically rendered */}
        <div className="relative z-10 flex items-center gap-4 pl-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeTab;

            return (
              <button
                key={index}
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                onClick={() => handleTabClick(index, item.path)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 pointer-events-auto ${
                  isActive ? "text-red-500" : "text-white/50 hover:text-white/80"
                }`}
                aria-label={item.label}
                type="button"
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
