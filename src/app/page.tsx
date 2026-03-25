"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";

import { useScan } from "@/hooks/useScan";
import { HeroSection } from "@/components/scanner/HeroSection";
import { ScannerForm } from "@/components/scanner/ScannerForm";
import { ScanResultCard } from "@/components/scanner/ScanResultCard";

export default function Home() {
  const { url, setUrl, loading, result, scannedUrl, error, scan } = useScan();

  return (
    <div className="w-full flex flex-col items-center gap-5 px-4 md:px-12 py-12 md:py-20 overflow-hidden relative">
      <HeroSection />

      <div className="w-full flex flex-col items-center">
        <ScannerForm
          url={url}
          loading={loading}
          onUrlChange={setUrl}
          onSubmit={scan}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-3xl mb-8 z-10"
            >
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/10 border-red-200">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <ScanResultCard result={result} scannedUrl={scannedUrl} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
