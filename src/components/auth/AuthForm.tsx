"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, Lock, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import axios from "axios";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const isRegister = mode === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegister && !name) return;

    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? { name, email, password }
        : { email, password };

      const res = await api.post(endpoint, payload);
      login(res.data.user, res.data.token);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === "string") {
          setError(detail);
        } else if (Array.isArray(detail)) {
          // Pydantic 422 validation errors — extract messages
          setError(detail.map((e: { msg: string }) => e.msg).join(", "));
        } else {
          setError("An error occurred");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-73px)]">
      {/* Left Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t(isRegister ? "auth.create" : "auth.welcome")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {t(isRegister ? "auth.create_desc" : "auth.login_desc")}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              {isRegister && (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={t("auth.name")}
                    className="pl-10 h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder={t("auth.email")}
                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder={t("auth.password")}
                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t(isRegister ? "auth.signup" : "auth.signin")}
                </span>
              ) : (
                t(isRegister ? "auth.signup" : "auth.signin")
              )}
            </Button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
              {t(isRegister ? "auth.have_account" : "auth.no_account")}{" "}
              <Link
                href={isRegister ? "/login" : "/register"}
                className="text-blue-600 hover:underline font-bold"
              >
                {t(isRegister ? "auth.signin" : "auth.signup")}
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right Side: Illustration */}
      <div className="hidden md:flex w-1/2 bg-slate-50 dark:bg-slate-900 items-center justify-center p-12 border-l border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 mix-blend-multiply" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-lg z-10 text-center"
        >
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {t("auth.shield_title")}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            {t("auth.shield_desc")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
