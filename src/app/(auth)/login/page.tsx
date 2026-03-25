"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login for diploma thesis (no real DB connection required yet)
    if (email && password) {
      login({ id: "1", name: "Admin User", email }, "mock-jwt-token-12345");
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
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("auth.welcome")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {t("auth.login_desc")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder={t("auth.email")}
                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-900"
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
                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md">
              {t("auth.signin")}
            </Button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
              {t("auth.no_account")}{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                {t("auth.signup")}
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
          <Shield className="w-32 h-32 mx-auto text-blue-500 mb-8 opacity-80" />
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Enterprise Grade Security</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Powered by advanced Machine Learning algorithms, PhishShield protects your digital perimeter with real-time analysis and zero-day threat detection.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
