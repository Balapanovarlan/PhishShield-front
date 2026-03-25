"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Shield, AlertTriangle, Activity, Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Stats {
  total_scans: number;
  phishing_detected: number;
  safe_urls: number;
  model_a_scans: number;
  model_b_scans: number;
}

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

const COLORS = ["#ef4444", "#10b981"];

export default function Dashboard() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/blacklist"),
    ])
      .then(([statsRes, blRes]) => {
        setStats(statsRes.data);
        setBlacklist(blRes.data.items);
      })
      .catch(() => {
        // Will be caught by 401/403 interceptor
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  const handleRemoveFromBlacklist = async (id: number) => {
    await api.delete(`/admin/blacklist/${id}`);
    setBlacklist((prev) => prev.filter((item) => item.id !== id));
  };

  if (!isAuthenticated || user?.role !== "admin") return null;
  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const modelData = [
    { name: "Model A (Content)", scans: stats.model_a_scans },
    { name: "Model B (URL)", scans: stats.model_b_scans },
  ];

  const pieData = [
    { name: "Phishing", value: stats.phishing_detected },
    { name: "Legitimate", value: stats.safe_urls },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t("dashboard.title")}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">{t("dashboard.total_scans")}</CardTitle>
            <Database className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_scans.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">{t("dashboard.phishing_detected")}</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-500">{stats.phishing_detected.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">{t("dashboard.safe_urls")}</CardTitle>
            <Shield className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{stats.safe_urls.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-indigo-500" />
              {t("dashboard.model_usage")}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="scans" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-5 h-5 text-blue-500" />
              {t("dashboard.dataset_distribution")}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute right-8 top-24 space-y-3">
              {pieData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{entry.name}</span>
                  <span className="text-sm text-slate-400">({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Blacklist Table */}
      {blacklist.length > 0 && (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Auto-Blacklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">Domain</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">Scans</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">Phishing Hits</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">Avg Risk</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blacklist.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="py-3 px-2 font-mono text-slate-900 dark:text-white">{item.domain}</td>
                      <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400">{item.total_scans}</td>
                      <td className="py-3 px-2 text-center text-red-600 font-semibold">{item.phishing_count}</td>
                      <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-400">{Math.round(item.risk_score_avg * 100)}%</td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromBlacklist(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
