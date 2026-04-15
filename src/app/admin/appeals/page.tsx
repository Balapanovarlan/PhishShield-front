"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag, CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "@/lib/api";

interface AppealItem {
  id: number;
  url: string;
  domain: string;
  contact_email: string;
  contact_name: string;
  reason: string;
  status: string;
  admin_comment: string | null;
  created_at: string;
  resolved_at: string | null;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function AppealsPage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<AppealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [commentMap, setCommentMap] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchAppeals();
  }, [isAuthenticated, user, router, filter]);

  const fetchAppeals = () => {
    const params = filter === "all" ? "" : `?status=${filter}`;
    api.get(`/admin/appeals${params}`)
      .then((res) => setItems(res.data.items))
      .finally(() => setLoading(false));
  };

  const handleResolve = async (id: number, status: "approved" | "rejected") => {
    await api.patch(`/admin/appeals/${id}`, {
      status,
      admin_comment: commentMap[id] || "",
    });
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, admin_comment: commentMap[id] || null, resolved_at: new Date().toISOString() } : item
      )
    );
  };

  if (!isAuthenticated || user?.role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === "rejected") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const statusBadge = (status: string) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t("admin.appeals_title")}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t("admin.appeals_subtitle")}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["pending", "all", "approved", "rejected"] as FilterStatus[]).map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter(s); setLoading(true); }}
            className={filter === s ? "bg-blue-600 text-white" : ""}
          >
            {t(`admin.${s}`)}
          </Button>
        ))}
      </div>

      {items.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center text-slate-500">{t("admin.empty_appeals")}</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon(item.status)}
                    <div>
                      <CardTitle className="text-base font-mono">{item.domain}</CardTitle>
                      <p className="text-xs text-slate-400 mt-0.5 break-all">{item.url}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(item.status)}`}>
                    {t(`admin.${item.status}`)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact + Date */}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                  <span>{t("admin.contact")}: <strong className="text-slate-700 dark:text-slate-300">{item.contact_name}</strong> ({item.contact_email})</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                {/* Reason */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-500 mb-1">{t("admin.reason")}</p>
                  <p className="text-slate-800 dark:text-slate-200 text-[15px]">{item.reason}</p>
                </div>

                {/* Admin Comment (if resolved) */}
                {item.admin_comment && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-600 mb-1">{t("admin.comment")}</p>
                    <p className="text-blue-900 dark:text-blue-200 text-sm">{item.admin_comment}</p>
                  </div>
                )}

                {/* Actions for pending appeals */}
                {item.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input
                      type="text"
                      placeholder={t("admin.comment_placeholder")}
                      value={commentMap[item.id] || ""}
                      onChange={(e) => setCommentMap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      className="flex-1 h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleResolve(item.id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("admin.approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(item.id, "rejected")}
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {t("admin.reject")}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
