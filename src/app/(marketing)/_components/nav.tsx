"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useLocale, type Locale } from "@/lib/i18n";
import { localeNames } from "@/lib/i18n/translations";

const navLinks = [
  { key: "home" as const, href: "/" },
  { key: "findJobs" as const, href: "/jobs" },
  { key: "features" as const, href: "/#features" },
  { key: "resources" as const, href: "/resources" },
  { key: "resumeBuilder" as const, href: "/resume-builder" },
  { key: "forCompanies" as const, href: "/login" },
];

export default function MarketingNav() {
  const { tr, locale, setLocale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">N</div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Negarit</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {tr(l.key)}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                <Globe size={15} />
                <span className="hidden sm:inline font-medium">{localeNames[locale]}</span>
                <ChevronDown size={13} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 min-w-[160px]">
                    {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => { setLocale(code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          locale === code
                            ? "text-indigo-600 font-semibold bg-indigo-50"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Auth buttons */}
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              {tr("signIn")}
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              {tr("getStarted")}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
          {navLinks.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              {tr(l.key)}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex gap-3">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700">
              {tr("signIn")}
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
              {tr("getStarted")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
