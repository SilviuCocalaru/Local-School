"use client";

import { useState, useEffect, useRef } from "react";
import { FiHome, FiVideo, FiMessageCircle, FiUser } from "react-icons/fi";

interface BubbleStyle {
  left: number;
  width: number;
  height: number;
  scaleY: number;
  rotation: number;
  blur: number;
}

interface TrailBubble {
  left: number;
  width: number;
  opacity: number;
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
const BUBBLE_HEIGHT = 70;
const GAP = 32;

export default function LiquidGlassNav() {
  const [activeTab, setActiveTab] = useState(0);
  const [bubbleStyle, setBubbleStyle] = useState<BubbleStyle>({
    left: 0,
    width: BUBBLE_WIDTH,
    height: BUBBLE_HEIGHT,
    scaleY: 1,
    rotation: 0,
    blur: 0,
  });
  const [trailBubbles, setTrailBubbles] = useState<TrailBubble[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [prevTab, setPrevTab] = useState(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Calculate position for a given tab index
  const calculatePosition = (tabIndex: number): { left: number } => {
    const targetButtonLeft = CONTAINER_PADDING + tabIndex * (BUTTON_WIDTH + GAP);
    const targetLeft = targetButtonLeft + BUTTON_WIDTH / 2 - BUBBLE_WIDTH / 2;
    return { left: targetLeft };
  };

  // Initialize bubble position on mount
  useEffect(() => {
    const initialPos = calculatePosition(0);
    setBubbleStyle((prev) => ({ ...prev, left: initialPos.left }));

    // Entrance animation - slide up from bottom
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  // Play subtle water droplet sound
  const playWaterSound = () => {
    if (typeof window === "undefined") return;

    try {
      const audioContext =
        audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 800Hz blip
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch (e) {
      // Audio context not supported
    }
  };

  // Handle tab change with enhanced physics animation
  useEffect(() => {
    if (activeTab === prevTab) return;
    if (activeTab === 0 && prevTab === 0) return;

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsScaling(true);
    playWaterSound();

    // Brief scale pulse on click
    setTimeout(() => setIsScaling(false), 200);

    setIsAnimating(true);
    const prevPos = calculatePosition(prevTab);
    const newPos = calculatePosition(activeTab);
    const distance = Math.abs(newPos.left - prevPos.left);
    const direction = newPos.left > prevPos.left ? 1 : -1;

    // Create trail bubbles for viscosity effect
    const trails: TrailBubble[] = [
      { left: prevPos.left, width: BUBBLE_WIDTH, opacity: 0.3 },
      { left: prevPos.left, width: BUBBLE_WIDTH, opacity: 0.15 },
    ];
    setTrailBubbles(trails);

    // Phase 1: Stretch & Squash (0-50ms)
    const stretchWidth = BUBBLE_WIDTH + distance * 1.2;
    const stretchLeft = Math.min(prevPos.left, newPos.left);
    setBubbleStyle({
      left: stretchLeft,
      width: stretchWidth,
      height: BUBBLE_HEIGHT * 0.85, // Vertical squash
      scaleY: 0.85,
      rotation: direction * -2, // Tilt in direction of movement
      blur: 1,
    });

    // Phase 2: Continue stretch peak (50-150ms)
    animationTimeoutRef.current = setTimeout(() => {
      setBubbleStyle({
        left: stretchLeft,
        width: stretchWidth,
        height: BUBBLE_HEIGHT * 0.82,
        scaleY: 0.82,
        rotation: direction * -2.5,
        blur: 1,
      });
    }, 50);

    // Phase 2b: Momentum - overshoot target (150-400ms)
    animationTimeoutRef.current = setTimeout(() => {
      const overshoot = direction * 8;
      setBubbleStyle({
        left: newPos.left + overshoot,
        width: BUBBLE_WIDTH * 1.05,
        height: BUBBLE_HEIGHT,
        scaleY: 1,
        rotation: 0,
        blur: 0.5,
      });
    }, 150);

    // Phase 2c: Snap back to target (400ms)
    animationTimeoutRef.current = setTimeout(() => {
      setBubbleStyle({
        left: newPos.left,
        width: BUBBLE_WIDTH,
        height: BUBBLE_HEIGHT,
        scaleY: 1,
        rotation: 0,
        blur: 0,
      });
    }, 400);

    // Phase 3: Wobble/Jiggle - First contract (500ms)
    animationTimeoutRef.current = setTimeout(() => {
      setBubbleStyle({
        left: newPos.left,
        width: 58,
        height: BUBBLE_HEIGHT * 0.95,
        scaleY: 0.95,
        rotation: 0,
        blur: 0,
      });
    }, 500);

    // Phase 3b: Wobble - Expand (600ms)
    animationTimeoutRef.current = setTimeout(() => {
      setBubbleStyle({
        left: newPos.left,
        width: 62,
        height: BUBBLE_HEIGHT * 1.05,
        scaleY: 1.05,
        rotation: 0,
        blur: 0,
      });
    }, 600);

    // Phase 3c: Wobble - Final contract (700ms)
    animationTimeoutRef.current = setTimeout(() => {
      setBubbleStyle({
        left: newPos.left,
        width: BUBBLE_WIDTH,
        height: BUBBLE_HEIGHT,
        scaleY: 1,
        rotation: 0,
        blur: 0,
      });
      setTrailBubbles([]);
    }, 700);

    // Phase 4: Final settle (850ms)
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 850);

    setPrevTab(activeTab);

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [activeTab, prevTab]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 flex justify-center items-end pb-safe transition-transform duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Background gradient with animated orbs */}
      <div className="absolute inset-0 -z-10 w-96 h-96 -left-48 -top-32 blur-3xl pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2d1b4e] to-[#4a2d6e] rounded-full" />
        {/* Pulsing orbs */}
        <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation container with glassmorphism */}
      <div className="relative p-3 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-2xl saturate-[180%] border border-white/20 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] mb-8">
        {/* Trail bubbles for viscosity effect */}
        {trailBubbles.map((trail, index) => (
          <div
            key={`trail-${index}`}
            style={{
              position: "absolute",
              left: `${trail.left}px`,
              width: `${trail.width}px`,
              height: "70px",
              borderRadius: "9999px",
              top: "12px",
              opacity: trail.opacity,
              zIndex: -1,
            }}
            className="pointer-events-none"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200/25 via-purple-300/15 to-pink-200/20 backdrop-blur-xl border border-purple-200/30" />
          </div>
        ))}

        {/* Animated bubble */}
        <div
          style={{
            position: "absolute",
            left: `${bubbleStyle.left}px`,
            width: `${bubbleStyle.width}px`,
            height: `${bubbleStyle.height}px`,
            borderRadius: "9999px",
            top: "12px",
            transition: isAnimating ? "none" : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 0,
            transform: `scaleY(${bubbleStyle.scaleY}) rotate(${bubbleStyle.rotation}deg)`,
            filter: `blur(${bubbleStyle.blur}px) drop-shadow(0 0 ${8 * (1 - bubbleStyle.blur)}px rgba(255,255,255,0.3))`,
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

          {/* Layer 5: Caustic/Refraction effect */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-200/20 via-transparent to-blue-200/20 animate-spin"
            style={{
              animationDuration: "8s",
            }}
          />

          {/* Layer 6: Surface tension edge */}
          <div className="absolute inset-0 rounded-full border-t border-white/60 blur-px" />

          {/* Ripple effect on landing */}
          {isAnimating && (
            <div
              className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"
              style={{
                animationDuration: "600ms",
                animationIterationCount: "1",
              }}
            />
          )}

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
                    ? "text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                    : "text-white/50 hover:text-white/80"
                } ${isScaling && isActive ? "scale-95" : isActive ? "scale-105" : "scale-100"}`}
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

        .blur-px {
          filter: blur(1px);
        }
      `}</style>
    </div>
  );
}
