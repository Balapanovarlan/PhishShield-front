"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import api from "@/lib/api";

interface BlacklistItem {
  id: number;
  domain: string;
  url_example: string | null;
  total_scans: number;
  phishing_count: number;
  risk_score_avg: number;
  explanations: string[] | null;
  promoted_at: string | null;
  created_at: string;
}

export default function BlacklistPage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    api.get("/admin/blacklist")
      .then((res) => setItems(res.data.items))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  const handleRemove = async (id: number) => {
    await api.delete(`/admin/blacklist/${id}`);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (!isAuthenticated || user?.role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t("admin.blacklist_title")}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t("admin.blacklist_subtitle")}</p>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {t("admin.blacklist")}
            <span className="ml-2 text-sm font-normal text-slate-400">({items.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">{t("admin.empty_blacklist")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.domain")}</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.scans")}</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.phishing_hits")}</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.avg_risk")}</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.promoted_at")}</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-medium text-slate-900 dark:text-white">{item.domain}</div>
                        {item.url_example && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[300px]">{item.url_example}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{item.total_scans}</td>
                      <td className="py-3 px-3 text-center text-red-600 font-semibold">{item.phishing_count}</td>
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">{Math.round(item.risk_score_avg * 100)}%</td>
                      <td className="py-3 px-3 text-center text-slate-500 text-xs">
                        {item.promoted_at ? new Date(item.promoted_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t("admin.remove")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
