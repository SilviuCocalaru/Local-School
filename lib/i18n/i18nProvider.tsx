"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, I18nContextType, getTranslation, TranslationNamespace } from "@/lib/i18n/translations";

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const savedLang = typeof window !== "undefined" ? localStorage.getItem("language") : null;
    if (savedLang && ["en", "ro", "ru"].includes(savedLang)) {
      setLanguageState(savedLang as Language);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  const t = (key: string, namespace: TranslationNamespace = "common"): string => {
    return getTranslation(language, namespace, key);
  };

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
