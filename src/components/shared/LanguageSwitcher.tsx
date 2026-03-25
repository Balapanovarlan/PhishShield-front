"use client";

import { motion } from "framer-motion";
import { useLanguage } from "../../lib/LanguageContext";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  const languages = [
    { id: "en", label: "Eng" },
    { id: "ru", label: "Рус" },
    { id: "kz", label: "Қаз" },
  ] as const;

  return (
    <div className="relative flex items-center bg-[#E5E7EB] dark:bg-slate-800 p-1 rounded-full h-9 w-[180px] select-none">
      {/* Animated Slider Background */}
      <motion.div
        className="absolute h-7 bg-white dark:bg-slate-950 rounded-full shadow-sm"
        initial={false}
        animate={{
          x: lang === "en" ? 0 : lang === "ru" ? 58 : 116,
          width: 58,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {/* Buttons */}
      {languages.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          className={`relative z-10 flex-1 text-[13px] font-medium transition-colors duration-200 ${
            lang === l.id 
              ? "text-slate-900 dark:text-white" 
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
