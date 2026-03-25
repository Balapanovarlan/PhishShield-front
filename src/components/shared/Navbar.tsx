"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useLanguage } from "../../lib/LanguageContext";
import { useAuth } from "../../lib/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full py-4 px-6 md:px-12 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="rounded-lg">
          <Image src="/images/phishshield-logo.png" alt="logo" width={48} height={48} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">PhishShield</h1>
      </Link>

      <nav className="hidden md:flex gap-6 items-center text-sm font-medium text-slate-600 dark:text-slate-300">
        {isAuthenticated && (
          <Link href="/dashboard" className={`hover:text-blue-600 transition-colors ${pathname === '/dashboard' ? 'text-blue-600 font-semibold' : ''}`}>
            {t("nav.dashboard")}
          </Link>
        )}

        {/* Language Picker */}
        <LanguageSwitcher />

        {/* Auth Buttons */}
        {isAuthenticated ? (
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-slate-500 hover:text-red-600">
            <LogOut className="w-4 h-4" />
            {t("nav.logout")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">{t("nav.login")}</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">{t("nav.register")}</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
