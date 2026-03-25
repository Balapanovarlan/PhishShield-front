"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Trash2, ShieldBan, ShieldCheck, UserPlus, X } from "lucide-react";
import api from "@/lib/api";

interface UserItem {
  id: number;
  email: string;
  name: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

export default function UsersPage() {
  const { isAuthenticated, user: currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("user");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchUsers();
  }, [isAuthenticated, currentUser, router]);

  const fetchUsers = () => {
    api.get("/admin/users")
      .then((res) => setUsers(res.data.items))
      .finally(() => setLoading(false));
  };

  const handleBlock = async (id: number) => {
    await api.patch(`/admin/users/${id}/block`);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_blocked: true } : u)));
  };

  const handleUnblock = async (id: number) => {
    await api.patch(`/admin/users/${id}/unblock`);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_blocked: false } : u)));
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("admin.confirm_delete"))) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      const res = await api.post("/admin/users", {
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      });
      setUsers((prev) => [res.data, ...prev]);
      setShowForm(false);
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormRole("user");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setFormError(typeof detail === "string" ? detail : "Error creating user");
    }
  };

  if (!isAuthenticated || currentUser?.role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t("admin.users_title")}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t("admin.users_subtitle")}</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showForm ? t("admin.cancel") : t("admin.add_user")}
        </Button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <Card className="shadow-sm border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder={t("admin.name")}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="h-10"
              />
              <Input
                type="email"
                placeholder={t("admin.email")}
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                className="h-10"
              />
              <Input
                type="password"
                placeholder={t("admin.password")}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                required
                className="h-10"
              />
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit" className="h-10 bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
                {t("admin.create")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-blue-500" />
            {t("admin.users")}
            <span className="ml-2 text-sm font-normal text-slate-400">({users.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">{t("admin.empty_users")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.name")}</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.email")}</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.role")}</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.status")}</th>
                    <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.created")}</th>
                    <th className="text-right py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.is_blocked
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          }`}>
                            {u.is_blocked ? t("admin.blocked") : t("admin.active")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500 text-xs">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {!isSelf && (
                            <div className="flex items-center justify-end gap-1">
                              {u.is_blocked ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnblock(u.id)}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                >
                                  <ShieldCheck className="w-4 h-4 mr-1" />
                                  {t("admin.unblock")}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBlock(u.id)}
                                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                >
                                  <ShieldBan className="w-4 h-4 mr-1" />
                                  {t("admin.block")}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(u.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {t("admin.delete")}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
