"use client";

import { useState } from "react";
import { FiPlus, FiX, FiImage, FiVideo } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleCreatePost = (type: "photo" | "video") => {
    router.push(`/create?type=${type}`);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-40">
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          <button
            onClick={() => handleCreatePost("photo")}
            className="glass-strong rounded-full p-4 shadow-xl hover:scale-110 transition-transform flex items-center gap-3 group"
          >
            <FiImage className="text-2xl text-purple-300" />
            <span className="text-white font-medium pr-2">Photo</span>
          </button>
          <button
            onClick={() => handleCreatePost("video")}
            className="glass-strong rounded-full p-4 shadow-xl hover:scale-110 transition-transform flex items-center gap-3 group"
          >
            <FiVideo className="text-2xl text-pink-300" />
            <span className="text-white font-medium pr-2">Video</span>
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-strong rounded-full p-5 shadow-2xl hover:scale-110 transition-transform bg-gradient-to-r from-purple-500 to-pink-500"
      >
        {isOpen ? (
          <FiX className="text-2xl text-white" />
        ) : (
          <FiPlus className="text-2xl text-white" />
        )}
      </button>
    </div>
  );
}

