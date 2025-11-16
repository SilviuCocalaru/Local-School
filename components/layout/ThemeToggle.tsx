"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { FiSun, FiMoon } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 backdrop-blur-[80px] saturate-[200%] border border-white/15 flex items-center justify-center hover:bg-white/10 transition-all touch-target"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <FiSun className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      ) : (
        <FiMoon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      )}
    </motion.button>
  );
}

