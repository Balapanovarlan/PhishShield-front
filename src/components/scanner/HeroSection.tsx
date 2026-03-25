"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <div className="w-full flex items-center justify-center gap-10">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-1/1.5 max-w-4xl text-center space-y-6 z-10"
      >
        <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {t("hero.title")}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">
            {t("hero.title_highlight")}
          </span>
        </h2>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {t("hero.subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="opacity-80 dark:opacity-40 max-w-lg w-full pointer-events-none"
      >
        <Image src="/images/hacker-fishing-credit-card.png" alt="phishing" width={600} height={512} />
      </motion.div>
    </div>
  );
}
