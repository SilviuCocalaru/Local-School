"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, I18nContextType, getTranslation, TranslationNamespace } from "@/lib/i18n/translations";

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage and listen to changes
  useEffect(() => {
    // Set initial language from localStorage
    const savedLang = typeof window !== "undefined" ? localStorage.getItem("language") : null;
    if (savedLang && ["en", "ro", "ru"].includes(savedLang)) {
      setLanguageState(savedLang as Language);
    }
    
    // Listen for language changes from LanguageSwitcher
    const handleLanguageChange = (event: CustomEvent<{ language: Language }>) => {
      const newLang = event.detail.language;
      if (["en", "ro", "ru"].includes(newLang)) {
        setLanguageState(newLang as Language);
      }
    };

    // Listen for storage changes (useful for multi-tab sync)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "language" && event.newValue) {
        const newLang = event.newValue;
        if (["en", "ro", "ru"].includes(newLang)) {
          setLanguageState(newLang as Language);
        }
      }
    };

    window.addEventListener("language-changed", handleLanguageChange as EventListener);
    window.addEventListener("storage", handleStorageChange);

    setMounted(true);

    return () => {
      window.removeEventListener("language-changed", handleLanguageChange as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (["en", "ro", "ru"].includes(lang)) {
      setLanguageState(lang);
      if (typeof window !== "undefined") {
        localStorage.setItem("language", lang);
      }
    }
  }, []);

  const t = useCallback((key: string, namespace: TranslationNamespace = "common"): string => {
    return getTranslation(language, namespace, key);
  }, [language]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};
