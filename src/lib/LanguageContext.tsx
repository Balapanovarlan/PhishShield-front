"use client";

import React, { createContext, useContext, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./i18n";
import api from "./api";

type Language = "en" | "ru" | "kz";

interface LanguageContextType {
  lang: Language;
  t: (key: string) => string;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation();

  const lang = (i18n.language || "ru") as Language;

  // Load saved language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language;
    if (saved && ["en", "ru", "kz"].includes(saved)) {
      i18n.changeLanguage(saved);
      api.defaults.headers.common["locale"] = saved === "kz" ? "ru" : saved;
    } else {
      api.defaults.headers.common["locale"] = "ru";
    }
  }, [i18n]);

  const setLang = useCallback(
    (newLang: Language) => {
      i18n.changeLanguage(newLang);
      localStorage.setItem("lang", newLang);
      api.defaults.headers.common["locale"] = newLang === "kz" ? "ru" : newLang;
    },
    [i18n]
  );

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
