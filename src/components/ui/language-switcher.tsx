"use client";

import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLocale, type Locale } from "@/lib/i18n";
import { localeNames } from "@/lib/i18n/translations";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
        aria-label="Switch language"
      >
        <Globe size={15} />
        {!compact && (
          <span className="hidden sm:inline font-medium text-xs">{localeNames[locale]}</span>
        )}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 min-w-[150px]">
            {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
              <button
                key={code}
                onClick={() => { setLocale(code); setOpen(false); }}
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
  );
}
