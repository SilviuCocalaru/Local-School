"use client";

import React, { useState, useEffect } from "react";
import { FiGlobe } from "react-icons/fi";

export default function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguageState] = useState<string>("en");

  // All hooks called unconditionally at top level
  useEffect(() => {
    setMounted(true);
    // Load language from localStorage on mount
    const savedLang = localStorage.getItem("language") || "en";
    setLanguageState(savedLang);
  }, []);

  if (!mounted) return null;

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    // Trigger a custom event to notify app of language change
    window.dispatchEvent(new CustomEvent("language-changed", { detail: { language: lang } }));
    // Force page rerender by dispatching storage event
    window.dispatchEvent(new StorageEvent("storage", {
      key: "language",
      newValue: lang,
      oldValue: language,
      storageArea: localStorage,
    }));
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "ro", name: "Română" },
    { code: "ru", name: "Русский" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-full transition-colors pointer-events-auto"
        aria-label="Language"
        type="button"
      >
        <FiGlobe className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white/10 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              type="button"
              className={`w-full px-4 py-2 text-left hover:bg-white/20 dark:hover:bg-white/10 transition-colors pointer-events-auto ${
                language === lang.code ? "bg-blue-500/30 font-medium" : ""
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
