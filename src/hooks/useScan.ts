"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ScanResult } from "@/types";
import { useLanguage } from "@/lib/LanguageContext";
import api from "@/lib/api";
import axios from "axios";

function formatUrl(url: string): string {
  return url.startsWith("http") ? url : `http://${url}`;
}

export function useScan() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scannedUrl, setScannedUrl] = useState("");
  const [error, setError] = useState("");
  const { lang } = useLanguage();

  const lastScannedUrlRef = useRef("");
  const prevLangRef = useRef(lang);

  const scan = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const urlToScan = url.trim();
    if (!urlToScan) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post<ScanResult>("/check", { url: formatUrl(urlToScan) });
      setResult(response.data);
      setScannedUrl(urlToScan);
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

  // Re-scan on language change so backend returns translated explanations
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;

    const scanUrl = lastScannedUrlRef.current;
    if (!scanUrl || !result) return;

    api.post<ScanResult>("/check", { url: formatUrl(scanUrl) }).then((response) => {
      setResult(response.data);
    });
  }, [lang, result]);

  return { url, setUrl, loading, result, scannedUrl, error, scan };
}
