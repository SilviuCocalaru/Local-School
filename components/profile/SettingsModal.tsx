"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/i18nProvider";
import { FiX, FiCheck } from "react-icons/fi";

interface UserSettings {
  age: number | null;
  gender: "male" | "female" | null;
  interests: string[];
  profile_picture: string | null;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const interests = [
  "music",
  "painting",
  "gaming",
  "sports",
  "art",
  "technology",
  "travel",
  "food",
  "fashion",
  "photography",
];

export default function SettingsModal({ isOpen, onClose, userId }: SettingsModalProps) {
  const { t } = useI18n();
  const supabase = createClient();

  const [settings, setSettings] = useState<UserSettings>({
    age: null,
    gender: null,
    interests: [],
    profile_picture: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, userId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("age, gender, interests, profile_picture")
        .eq("id", userId)
        .single();

      if (data) {
        setSettings({
          age: data.age || null,
          gender: data.gender || null,
          interests: data.interests || [],
          profile_picture: data.profile_picture || null,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          age: settings.age,
          gender: settings.gender,
          interests: settings.interests,
          profile_picture: settings.profile_picture,
        })
        .eq("id", userId);

      if (error) throw error;

      setMessage(t("changesSaved", "settings"));
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage(t("error", "common"));
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-profile-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);

      setSettings({ ...settings, profile_picture: publicUrl.publicUrl });
      setMessage("Photo uploaded successfully");
    } catch (error) {
      console.error("Error uploading photo:", error);
      setMessage("Failed to upload photo");
    }
  };

  const toggleInterest = (interest: string) => {
    setSettings({
      ...settings,
      interests: settings.interests.includes(interest)
        ? settings.interests.filter((i) => i !== interest)
        : [...settings.interests, interest],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card-glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 dark:border-white/5">
          <h2 className="text-xl font-semibold">{t("accountSettings", "settings")}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label={t("close", "common")}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message === t("changesSaved", "settings")
                  ? "bg-green-500/20 text-green-700 dark:text-green-300"
                  : "bg-red-500/20 text-red-700 dark:text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Profile Picture */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t("uploadPhoto", "profile")}</label>
            <div className="flex items-center gap-4">
              {settings.profile_picture && (
                <img
                  src={settings.profile_picture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
                id="profile-pic-input"
              />
              <label
                htmlFor="profile-pic-input"
                className="btn-glass cursor-pointer"
              >
                {t("changePhoto", "profile")}
              </label>
            </div>
          </div>

          {/* Age Picker */}
          <div className="space-y-3">
            <label htmlFor="age" className="text-sm font-medium">
              {t("selectAge", "profile")}
            </label>
            <select
              id="age"
              value={settings.age || ""}
              onChange={(e) => setSettings({ ...settings, age: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full p-3 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("selectAge", "profile")}</option>
              {Array.from({ length: 13 }, (_, i) => 13 + i).map((age) => (
                <option key={age} value={age}>
                  {age} {t("common.years", "profile") || "years"}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t("selectGender", "profile")}</label>
            <div className="flex gap-4">
              {["male", "female"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setSettings({ ...settings, gender: gender as "male" | "female" })}
                  className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all ${
                    settings.gender === gender
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10"
                  }`}
                >
                  {t(gender, "profile")}
                </button>
              ))}
            </div>
          </div>

          {/* Interests Multi-Select */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t("selectInterests", "profile")}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`py-2 px-3 rounded-full text-sm font-medium transition-all ${
                    settings.interests.includes(interest)
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10"
                  }`}
                >
                  {t(interest, "profile")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl font-medium bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
          >
            {t("cancel", "common")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 px-4 rounded-2xl font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <FiCheck className="w-4 h-4" />
            {saving ? t("loading", "common") : t("save", "common")}
          </button>
        </div>
      </div>
    </div>
  );
}
