"use client";

import { useState, useCallback, useRef } from "react";
import { Search, Activity, CheckCircle2, Info, ChevronRight, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { ScanResult } from "@/types";
import api from "@/lib/api";
import axios from "axios";
import Image from "next/image";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const { lang, t } = useLanguage();

  const lastScannedUrlRef = useRef("");

  const handleScan = useCallback(async (e?: React.FormEvent, targetUrl?: string) => {
    if (e) e.preventDefault();
    const urlToScan = (targetUrl || url).trim();
    if (!urlToScan) return;

    setLoading(true);
    setError("");
    if (!targetUrl) setResult(null);

    try {
      const formattedUrl = urlToScan.startsWith("http") ? urlToScan : `http://${urlToScan}`;
      const response = await api.post<ScanResult>("/check", { url: formattedUrl });
      setResult(response.data);
      lastScannedUrlRef.current = urlToScan;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message || "An unexpected error occurred");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  // Re-scan on language change (stable ref, no dependency on handleScan)
  const prevLangRef = useRef(lang);
  if (prevLangRef.current !== lang) {
    prevLangRef.current = lang;
    if (lastScannedUrlRef.current && result) {
      // Schedule re-scan after render
      setTimeout(() => {
        const scanUrl = lastScannedUrlRef.current;
        if (scanUrl) {
          const formattedUrl = scanUrl.startsWith("http") ? scanUrl : `http://${scanUrl}`;
          api.post<ScanResult>("/check", { url: formattedUrl }).then((response) => {
            setResult(response.data);
          });
        }
      }, 0);
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-5 px-4 md:px-12 py-12 md:py-20 overflow-hidden relative">
      <div className="w-full flex  items-center justify-center gap-10 ">
        {/* Background decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-1/1.5 max-w-4xl text-center space-y-6  z-10"
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

        {/* Decorative Vector SVG placeholder for Landing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="opacity-80 dark:opacity-40 max-w-lg w-full pointer-events-none"
        >
          <Image src="/images/hacker-fishing-credit-card.png" alt="phishing" width={600} height={512} />
        </motion.div>

      </div>
      <div className="w-full flex flex-col items-center">
                {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-2xl z-10 mb-10"
        >
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <Input
                type="text"
                placeholder={t("scanner.placeholder")}
                className="pl-4 h-14 text-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-lg rounded-xl focus-visible:ring-blue-600 transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              disabled={loading || !url}
            >
              {loading ? (
                <span className="flex items-center gap-2"><Activity className="w-5 h-5 animate-spin" /> {t("scanner.scanning")}</span>
              ) : (
                t("scanner.scan_btn")
              )}
            </Button>
          </form>
        </motion.div>

        {/* Error Alert */}
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

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-3xl z-10"
            >
              <Card className="relative overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-2xl bg-white dark:bg-slate-950">
                {/* Left Color Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                  result.status === "Legitimate" ? "bg-[#22c55e]" :
                  result.status === "Phishing" ? "bg-[#ef4444]" : "bg-[#f59e0b]"
                }`} />

                <div className="p-8 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6 pl-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {result.status === "Legitimate" && <CheckCircle2 className="w-8 h-8 text-[#22c55e]" strokeWidth={2} />}
                      {result.status === "Phishing" && <XCircle className="w-8 h-8 text-[#ef4444]" strokeWidth={2} />}
                      {result.status === "Unknown" && <AlertTriangle className="w-8 h-8 text-[#f59e0b]" strokeWidth={2} />}
                      <h3 className={`text-[28px] font-semibold tracking-tight ${
                        result.status === "Legitimate" ? "text-[#22c55e]" :
                        result.status === "Phishing" ? "text-[#ef4444]" : "text-[#f59e0b]"
                      }`}>
                        {result.status === "Legitimate" ? t("result.safe") : result.status === "Phishing" ? t("result.malicious") : "Unknown"}
                      </h3>
                    </div>
                    <p className="text-[17px] text-slate-600 dark:text-slate-400 mt-2 break-all">{url}</p>
                  </div>

                  <div className="md:text-right shrink-0">
                    <div className="text-sm font-medium text-slate-500 mb-1">{t("result.threat_risk")}</div>
                    <div className={`text-[44px] font-bold leading-none ${
                      result.risk_score > 0.5 ? 'text-[#ef4444]' : 'text-[#22c55e]'
                    }`}>
                      {Math.round(result.risk_score * 100)}%
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 mx-10" />

                <div className="px-10 py-8 space-y-8">
                  {/* Method Information Box */}
                  <div className="bg-[#f8fafc] dark:bg-slate-900 border border-[#e2e8f0] dark:border-slate-800 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <Info className="w-6 h-6 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm tracking-wide text-blue-800 dark:text-blue-400 mb-2 uppercase">
                          {t("result.method")}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-[15px] mb-4">
                          {result.details}
                        </p>
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#eff6ff] dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                          {result.method}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* XAI Explanations */}
                  {result.explanations && result.explanations.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                          {t("result.xai_title")}
                        </h4>
                      </div>
                      <div className="grid gap-3">
                        {result.explanations.map((exp, idx) => {
                          const isRisk = exp.toLowerCase().includes("risk") || exp.toLowerCase().includes("риск") || exp.toLowerCase().includes("threat") || exp.toLowerCase().includes("угроза") || exp.toLowerCase().includes("warning") || exp.toLowerCase().includes("предупр");
                          const isSafe = exp.toLowerCase().includes("safe") || exp.toLowerCase().includes("безопасн") || exp.toLowerCase().includes("trust") || exp.toLowerCase().includes("доверие");

                          return (
                            <div key={idx} className="flex items-start gap-3 text-[15px]">
                              <div className="mt-1">
                                <ChevronRight className={`w-4 h-4 ${
                                  isRisk ? 'text-red-500' : isSafe ? 'text-emerald-500' : 'text-slate-400'
                                }`} />
                              </div>
                              <span className={`${
                                isRisk ? 'text-red-900 dark:text-red-300' :
                                isSafe ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                {exp}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Risk Breakdown Section */}
                  {result.breakdown && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        {t("result.result_breakdown")}
                      </h4>
                      <div className="grid gap-5">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-400">{t("result.score_html")}</span>
                            <span className={result.breakdown.html > 0.5 ? 'text-red-500' : 'text-emerald-500'}>{Math.round(result.breakdown.html * 100)}%</span>
                          </div>
                          <Progress value={result.breakdown.html * 100} className={`h-1.5 ${result.breakdown.html > 0.5 ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-400">{t("result.score_url")}</span>
                            <span className={result.breakdown.url > 0.5 ? 'text-red-500' : 'text-emerald-500'}>{Math.round(result.breakdown.url * 100)}%</span>
                          </div>
                          <Progress value={result.breakdown.url * 100} className={`h-1.5 ${result.breakdown.url > 0.5 ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-400">{t("result.score_reputation")}</span>
                            <span className={result.breakdown.reputation > 0.5 ? 'text-red-500' : 'text-emerald-500'}>{Math.round(result.breakdown.reputation * 100)}%</span>
                          </div>
                          <Progress value={result.breakdown.reputation * 100} className={`h-1.5 ${result.breakdown.reputation > 0.5 ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-400">{t("result.score_protocol")}</span>
                            <span className={result.breakdown.protocol > 0.5 ? 'text-red-500' : 'text-emerald-500'}>{Math.round(result.breakdown.protocol * 100)}%</span>
                          </div>
                          <Progress value={result.breakdown.protocol * 100} className={`h-1.5 ${result.breakdown.protocol > 0.5 ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Confidence Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-3">
                      <span className="uppercase tracking-widest">{t("result.safe")}</span>
                      <span className="uppercase tracking-widest">{t("result.suspicious")}</span>
                      <span className="uppercase tracking-widest">{t("result.malicious")}</span>
                    </div>
                    <Progress
                      value={result.risk_score > 0 ? result.risk_score * 100 : 100}
                      className={`h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${
                        result.risk_score > 0.5 ? '[&>div]:bg-[#ef4444]' : '[&>div]:bg-[#22c55e]'
                      }`}
                    />
                    <div className="text-right text-sm text-slate-500 mt-3">
                      {t("result.confidence")} {Math.round(result.confidence * 100)}%
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </div>
  );
}
