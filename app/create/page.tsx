"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FiX, FiUpload, FiVideo, FiImage } from "react-icons/fi";

export const dynamic = 'force-dynamic';

function CreatePostContent() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const postType = (searchParams.get("type") || "photo") as "photo" | "video";
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (postType === "photo") {
      if (!selectedFile.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
    } else {
      if (!selectedFile.type.startsWith("video/")) {
        alert("Please select a video file");
        return;
      }
    }

    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = postType === "photo" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert(
        `File size must be less than ${maxSize / 1024 / 1024}MB`
      );
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    if (postType === "photo") {
      reader.readAsDataURL(selectedFile);
    } else {
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUploading(true);

    try {
      // Ensure user profile exists in public.users table
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (!existingUser) {
        // User profile doesn't exist, create it
        const { error: createUserError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || "User",
            school: user.user_metadata?.school || "Liceul Ciprian Porumbescu",
          });

        if (createUserError) throw createUserError;
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${postType}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(filePath);

      // Create post
      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.id,
        type: postType,
        media_url: publicUrl,
        caption: caption.trim() || null,
      });

      if (postError) throw postError;

      router.push("/feed");
    } catch (error: any) {
      console.error("Error uploading:", error);
      alert(error.message || "Failed to upload post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <header className="glass-strong rounded-2xl p-4 mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Create Post</h1>
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white"
          >
            <FiX className="text-2xl" />
          </button>
        </header>

        <div className="glass-strong rounded-2xl p-6 space-y-6">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/30 rounded-2xl p-12 text-center cursor-pointer hover:border-white/50 transition-colors"
            >
              {postType === "photo" ? (
                <FiImage className="text-5xl text-white/50 mx-auto mb-4" />
              ) : (
                <FiVideo className="text-5xl text-white/50 mx-auto mb-4" />
              )}
              <p className="text-white/70 mb-2">
                Tap to select {postType === "photo" ? "an image" : "a video"}
              </p>
              <p className="text-white/50 text-sm">
                {postType === "photo"
                  ? "Max size: 10MB"
                  : "Max size: 50MB, Max duration: 60s"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={postType === "photo" ? "image/*" : "video/*"}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                {postType === "photo" ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto rounded-2xl"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="w-full rounded-2xl"
                  />
                )}
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 glass-strong rounded-full p-2 text-white hover:bg-white/20"
                >
                  <FiX />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-xl text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30 resize-none backdrop-blur-sm"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full py-3 glass-strong rounded-xl font-semibold text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <FiUpload className="text-xl" />
                    Post
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CreatePostContent />
    </Suspense>
  );
}