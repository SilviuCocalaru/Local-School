"use client";

import { useState, useEffect, useRef } from "react";
import { FiHome, FiVideo, FiMessageCircle, FiUser } from "react-icons/fi";

interface BubbleStyle {
  left: number;
  width: number;
}

const navItems = [
  { icon: FiHome, label: "Home", color: "text-red-500" },
  { icon: FiVideo, label: "Videos", color: "text-red-500" },
  { icon: FiMessageCircle, label: "Chat", color: "text-red-500" },
  { icon: FiUser, label: "Profile", color: "text-red-500" },
];

const CONTAINER_PADDING = 12;
const BUTTON_WIDTH = 70;
const BUBBLE_WIDTH = 60;
const GAP = 32;

export default function LiquidGlassNav() {
  const [activeTab, setActiveTab] = useState(0);
  const [bubbleStyle, setBubbleStyle] = useState<BubbleStyle>({ left: 0, width: BUBBLE_WIDTH });
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevTab, setPrevTab] = useState(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate position for a given tab index
  const calculatePosition = (tabIndex: number): { left: number } => {
    const targetButtonLeft = CONTAINER_PADDING + tabIndex * (BUTTON_WIDTH + GAP);
    const targetLeft = targetButtonLeft + BUTTON_WIDTH / 2 - BUBBLE_WIDTH / 2;
    return { left: targetLeft };
  };

  // Initialize bubble position on mount
  useEffect(() => {
    const initialPos = calculatePosition(0);
    setBubbleStyle({ left: initialPos.left, width: BUBBLE_WIDTH });
  }, []);

  // Handle tab change with multi-phase animation
  useEffect(() => {
    if (activeTab === prevTab) return; // No change
    if (activeTab === 0 && prevTab === 0) return; // Skip animation on first render

    // Clear any pending animations
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsAnimating(true);
    const prevPos = calculatePosition(prevTab);
    const newPos = calculatePosition(activeTab);
    const distance = Math.abs(newPos.left - prevPos.left);

    // Phase 1: Stretch (0-50ms)
    const stretchWidth = BUBBLE_WIDTH + distance * 0.7;
    const stretchLeft = Math.min(prevPos.left, newPos.left);
    setBubbleStyle({ left: stretchLeft, width: stretchWidth });

    // Phase 2: Move & Contract (50-350ms)
    animationTimeoutRef.current = setTimeout(() => {
      setBubbleStyle({ left: newPos.left, width: BUBBLE_WIDTH });
    }, 50);

    // Phase 3: Bounce (350-650ms)
    animationTimeoutRef.current = setTimeout(() => {
      setBubbleStyle({ left: newPos.left, width: 64 });
    }, 350);

    // Phase 4: Rest (650-800ms)
    animationTimeoutRef.current = setTimeout(() => {
      setBubbleStyle({ left: newPos.left, width: BUBBLE_WIDTH });
      setIsAnimating(false);
    }, 650);

    setPrevTab(activeTab);

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [activeTab, prevTab]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      {/* Background gradient with animated orbs */}
      <div className="absolute inset-0 -z-10 w-96 h-96 -left-48 -top-32 blur-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2d1b4e] to-[#4a2d6e] rounded-full" />
        {/* Pulsing orbs */}
        <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation container with glassmorphism */}
      <div className="relative p-3 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-2xl saturate-[180%] border border-white/20 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        {/* Animated bubble */}
        <div
          style={{
            position: "absolute",
            left: `${bubbleStyle.left}px`,
            width: `${bubbleStyle.width}px`,
            height: "70px",
            borderRadius: "9999px",
            top: "12px",
            transition: isAnimating ? "none" : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 0,
          }}
          className="group"
        >
          {/* Layer 1: Outer glow */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-purple-300/30 via-pink-300/20 to-purple-400/30 blur-lg transition-transform duration-300 ${
              isAnimating ? "scale-110" : "scale-100"
            }`}
          />

          {/* Layer 2: Main glass with shimmer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200/25 via-purple-300/15 to-pink-200/20 backdrop-blur-xl border border-purple-200/30 overflow-hidden">
            {/* Shimmer animation */}
            {isAnimating && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{
                  animation: "shimmer 1.5s infinite",
                }}
              />
            )}
          </div>

          {/* Layer 3: Top-left highlight */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
              clipPath: "ellipse(40% 35% at 30% 30%)",
            }}
          />

          {/* Layer 4: Bottom-right reflection */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(225deg, transparent 0%, rgba(196,181,253,0.3) 100%)",
              clipPath: "ellipse(30% 25% at 70% 70%)",
            }}
          />

          {/* Active glow pulse */}
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
        </div>

        {/* Navigation buttons */}
        <div className="relative z-10 flex items-center gap-8">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeTab;

            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`w-[70px] h-[70px] rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  isActive
                    ? "text-red-500 scale-110 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                    : "text-white/50 hover:text-white/80"
                }`}
                aria-label={item.label}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Shimmer keyframe animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
