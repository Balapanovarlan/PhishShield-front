"use client";

import { useState } from "react";
import { Shield, AlertTriangle, Search, Activity, CheckCircle2, Info, ChevronRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ScanResult {
  status: string;
  method: string;
  risk_score: number;
  confidence: number;
  details: string;
  explanations?: string[];
  error?: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Allow testing without standard http:// schema initially
      const formattedUrl = url.startsWith("http") ? url : `http://${url}`;
      
      const response = await fetch("http://127.0.0.1:8000/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formattedUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with the API");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <header className="w-full py-4 px-6 md:px-12 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">PhishShield</h1>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
          <a href="#" className="hover:text-blue-600 transition-colors">API</a>
          <a href="#" className="hover:text-blue-600 transition-colors">About</a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 md:px-12 py-12 md:py-24">
        
        {/* Hero Section */}
        <div className="w-full max-w-3xl text-center space-y-6 mb-12">
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Advanced Phishing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Detection</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Real-time, AI-powered URL analysis using a hybrid deterministic and Machine Learning approach. Enter a URL below to perform a deep scan.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-12">
          <form onSubmit={handleScan} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <Input
                type="text"
                placeholder="https://example.com/login"
                className="pl-10 h-14 text-lg bg-white dark:bg-slate-900 border-slate-300 shadow-sm rounded-xl focus-visible:ring-blue-600"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all active:scale-95"
              disabled={loading || !url}
            >
              {loading ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                "Scan URL"
              )}
            </Button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full max-w-3xl mb-8">
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/10 border-red-200">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="w-full max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className={`border-l-8 ${result.status === "Legitimate" ? "border-l-emerald-500" : result.status === "Phishing" ? "border-l-red-500" : "border-l-slate-400"} shadow-lg overflow-hidden`}>
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {result.status === "Legitimate" && <CheckCircle2 className="w-7 h-7 text-emerald-500" />}
                      {result.status === "Phishing" && <XCircle className="w-7 h-7 text-red-500" />}
                      {result.status === "Unknown" && <AlertTriangle className="w-7 h-7 text-yellow-500" />}
                      
                      <span className={
                        result.status === "Legitimate" ? "text-emerald-700 dark:text-emerald-400" : 
                        result.status === "Phishing" ? "text-red-700 dark:text-red-400" : 
                        "text-slate-700 dark:text-slate-300"
                      }>
                        {result.status}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600 break-all">
                      {url}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-sm font-medium text-slate-500 mb-1">Threat Risk</div>
                    <div className="flex items-end gap-2">
                      <span className={`text-4xl font-black leading-none tracking-tighter ${result.risk_score > 0.5 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {Math.round(result.risk_score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-8 bg-white dark:bg-slate-950">
                {/* Method Information */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-blue-900 dark:text-blue-200">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm tracking-wide uppercase">Detection Method</h4>
                    <p className="text-sm opacity-90 leading-relaxed">{result.details}</p>
                    <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-blue-200 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300">
                      {result.method}
                    </div>
                  </div>
                </div>

                {/* XAI Explanations */}
                {result.explanations && result.explanations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-slate-400" />
                      AI Explainability Analysis
                    </h4>
                    <div className="space-y-2">
                      {result.explanations.map((exp, idx) => {
                        const isRisk = exp.toLowerCase().includes("risk");
                        const isSafe = exp.toLowerCase().includes("safe");
                        
                        return (
                          <div key={idx} className={`p-3 rounded-md border text-sm flex items-start gap-3 ${
                            isRisk ? "bg-red-50/50 border-red-100 text-red-900 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-200" : 
                            isSafe ? "bg-emerald-50/50 border-emerald-100 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-200" :
                            "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300"
                          }`}>
                            <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${isRisk ? 'text-red-500' : isSafe ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className="leading-relaxed">{exp}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Visual Confidence Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Safe</span>
                    <span>Suspicious</span>
                    <span>Malicious</span>
                  </div>
                  <Progress 
                    value={result.risk_score * 100} 
                    className={`h-2.5 rounded-full ${result.risk_score > 0.5 ? 'bg-red-100 dark:bg-red-950 [&>div]:bg-red-500' : 'bg-emerald-100 dark:bg-emerald-950 [&>div]:bg-emerald-500'}`} 
                  />
                  <div className="text-right text-xs text-slate-400 pt-1">
                    Model Confidence: {Math.round(result.confidence * 100)}%
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        PhishShield Diploma Project &copy; 2026. Data sourced from PhishTank and Tranco.
      </footer>
    </div>
  );
}
