"use client";

import { useState } from "react";
import { FiMoreHorizontal, FiTrash2, FiCopy, FiEdit } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface PostMenuProps {
  postId: string;
  isOwner: boolean;
  onDelete: () => void;
  onEdit?: () => void;
}

export default function PostMenu({ postId, isOwner, onDelete, onEdit }: PostMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    setShowMenu(false);
    // Could add a toast notification here
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  if (!isOwner) return null;

  return (
    <>
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMenu(!showMenu)}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 backdrop-blur-[60px] saturate-[180%] border border-white/15 flex items-center justify-center hover:bg-white/10 transition-all touch-target"
          aria-label="Post options"
        >
          <FiMoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-[24px] bg-white/5 dark:bg-black/30 backdrop-blur-[100px] saturate-[200%] border border-white/20 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
              >
                <div className="py-1">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 text-black dark:text-white hover:bg-white/5 dark:hover:bg-black/20 transition-colors"
                    >
                      <FiEdit className="text-lg" />
                      <span>Edit Caption</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 text-black dark:text-white hover:bg-white/5 dark:hover:bg-black/20 transition-colors"
                  >
                    <FiCopy className="text-lg" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 text-black dark:text-white hover:bg-white/10 dark:hover:bg-black/30 transition-colors"
                  >
                    <FiTrash2 className="text-lg" />
                    <span>Delete Post</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="rounded-[32px] p-6 max-w-sm w-full bg-white/5 dark:bg-black/30 backdrop-blur-[100px] saturate-[200%] border border-white/20 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                  Delete Post?
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60 mb-6">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-[24px] bg-white/5 dark:bg-black/30 backdrop-blur-[80px] saturate-[180%] border border-white/18 dark:border-white/10 text-black dark:text-white text-sm font-medium hover:bg-white/10 dark:hover:bg-black/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 rounded-[24px] bg-white/10 dark:bg-black/50 backdrop-blur-[80px] saturate-[180%] border border-white/20 dark:border-white/15 text-black dark:text-white text-sm font-medium hover:bg-white/15 dark:hover:bg-black/60 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

