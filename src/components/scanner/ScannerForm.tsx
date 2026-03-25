"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

interface ScannerFormProps {
  url: string;
  loading: boolean;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ScannerForm({ url, loading, onUrlChange, onSubmit }: ScannerFormProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-2xl z-10 mb-10"
    >
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={t("scanner.placeholder")}
            className={cn(
              "pl-4 h-14 text-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-lg rounded-xl focus-visible:ring-blue-600 transition-all",
              loading && "pointer-events-none opacity-60"
            )}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            readOnly={loading}
          />
        </div>
        <Button
          type="submit"
          className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          disabled={loading || !url}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("scanner.scanning")}
            </span>
          ) : (
            t("scanner.scan_btn")
          )}
        </Button>
      </form>
    </motion.div>
  );
}
