"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Info, ChevronRight, XCircle, AlertTriangle, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { ScanResult } from "@/types";
import api from "@/lib/api";

interface ScanResultCardProps {
  result: ScanResult;
  scannedUrl: string;
}

export function ScanResultCard({ result, scannedUrl }: ScanResultCardProps) {
  const { t } = useLanguage();
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealName, setAppealName] = useState("");
  const [appealEmail, setAppealEmail] = useState("");
  const [appealReason, setAppealReason] = useState("");
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealSent, setAppealSent] = useState(false);

  return (
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

        <div className="p-8 pb-0 flex flex-col md:flex-row md:items-start justify-between gap-6 pl-10">
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
            <p className="text-[17px] text-slate-600 dark:text-slate-400 mt-2 break-all">{scannedUrl}</p>
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

          {/* Report False Positive */}
          {result.status === "Phishing" && (
            <div className="pt-2">
              {appealSent ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {t("appeal.success")}
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAppeal(!showAppeal)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    {t("appeal.report_btn")}
                  </Button>

                  <AnimatePresence>
                    {showAppeal && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white mb-1">{t("appeal.title")}</h4>
                            <p className="text-sm text-slate-500">{t("appeal.desc")}</p>
                          </div>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setAppealLoading(true);
                              try {
                                await api.post("/appeals", {
                                  url: scannedUrl.startsWith("http") ? scannedUrl : `http://${scannedUrl}`,
                                  contact_name: appealName,
                                  contact_email: appealEmail,
                                  reason: appealReason,
                                });
                                setAppealSent(true);
                              } finally {
                                setAppealLoading(false);
                              }
                            }}
                            className="space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Input
                                placeholder={t("appeal.your_name")}
                                value={appealName}
                                onChange={(e) => setAppealName(e.target.value)}
                                required
                                className="h-10 bg-white dark:bg-slate-950"
                              />
                              <Input
                                type="email"
                                placeholder={t("appeal.your_email")}
                                value={appealEmail}
                                onChange={(e) => setAppealEmail(e.target.value)}
                                required
                                className="h-10 bg-white dark:bg-slate-950"
                              />
                            </div>
                            <textarea
                              placeholder={t("appeal.reason_placeholder")}
                              value={appealReason}
                              onChange={(e) => setAppealReason(e.target.value)}
                              required
                              rows={3}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <Button
                              type="submit"
                              disabled={appealLoading}
                              className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            >
                              {appealLoading ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  {t("appeal.submitting")}
                                </span>
                              ) : (
                                t("appeal.submit")
                              )}
                            </Button>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
