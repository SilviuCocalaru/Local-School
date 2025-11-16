"use client";

import { useState } from "react";
import { FiPlus, FiX, FiImage, FiVideo, FiFileText } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const actions = [
  { icon: FiImage, label: "Photo", type: "photo" as const, angle: 45, distance: 80 },
  { icon: FiVideo, label: "Video", type: "video" as const, angle: 90, distance: 80 },
  { icon: FiFileText, label: "Text", type: "photo" as const, angle: 135, distance: 80 },
];

export default function OrbitingFAB() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleAction = (type: "photo" | "video") => {
    router.push(`/create?type=${type}`);
    setIsExpanded(false);
  };

  const createRipple = (e: React.MouseEvent) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  };

  const hapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(isExpanded ? [10, 50, 10] : 10);
    }
  };

  return (
    <div className="fixed bottom-24 sm:bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 z-50">
      {/* Orbiting Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {actions.map((action, index) => {
              const Icon = action.icon;
              const radians = (action.angle * Math.PI) / 180;
              const x = Math.cos(radians) * action.distance;
              const y = -Math.sin(radians) * action.distance;

              return (
                <motion.button
                  key={action.label}
                  type="button"
                  initial={{ 
                    scale: 0, 
                    opacity: 0,
                    x: 0,
                    y: 0
                  }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    x: x,
                    y: y
                  }}
                  exit={{ 
                    scale: 0, 
                    opacity: 0,
                    x: 0,
                    y: 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    mass: 0.8,
                    delay: index * 0.05
                  }}
                  onClick={(e) => {
                    createRipple(e);
                    hapticFeedback();
                    handleAction(action.type);
                  }}
                  className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 backdrop-blur-[80px] saturate-[200%] border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all touch-target pointer-events-auto"
                  title={action.label}
                  aria-label={action.label}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.button>
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        type="button"
        onClick={(e) => {
          createRipple(e);
          hapticFeedback();
          setIsExpanded(!isExpanded);
        }}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-xl border border-white/30 shadow-[0_12px_36px_rgba(59,130,246,0.5)] relative overflow-hidden flex items-center justify-center touch-target pointer-events-auto"
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: isExpanded ? 1.1 : 1,
          rotate: isExpanded ? 45 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
          mass: 1
        }}
        aria-label={isExpanded ? "Close create menu" : "Open create menu"}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiX className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiPlus className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

