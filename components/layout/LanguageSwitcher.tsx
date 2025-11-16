"use client";

import React, { useState } from "react";
import { FiGlobe } from "react-icons/fi";
import { useI18n } from "@/lib/i18n/i18nProvider";
import type { Language } from "@/lib/i18n/translations";

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useI18n();

  const languages: Array<{ code: Language; name: string; flag: string }> = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ro", name: "Română", flag: "🇷🇴" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    setIsOpen(false);
    
    // Dispatch global language change event for any listeners
    window.dispatchEvent(new CustomEvent("language-changed", { 
      detail: { language: lang } 
    }));
  };

  return (
    <div className="relative">
      {/* Language selector button with visual indicator */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-full transition-colors pointer-events-auto hover:scale-110 transform duration-200"
        aria-label="Change language"
        aria-expanded={isOpen}
        title={`Current: ${language.toUpperCase()}`}
        type="button"
      >
        <FiGlobe className="w-5 h-5" />
      </button>

      {/* Language dropdown menu with active indicator */}
      {isOpen && (
        <div 
          className="absolute bottom-full right-0 mb-2 bg-white/10 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg z-50 min-w-48"
          role="menu"
        >
          {languages.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                type="button"
                role="menuitem"
                aria-current={isActive ? "true" : undefined}
                className={`w-full px-4 py-3 text-left hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 pointer-events-auto flex items-center justify-between group ${
                  isActive 
                    ? "bg-blue-500/40 dark:bg-blue-600/40 font-semibold text-blue-600 dark:text-blue-300 border-l-2 border-blue-500" 
                    : "hover:pl-5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isActive && (
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-300">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
