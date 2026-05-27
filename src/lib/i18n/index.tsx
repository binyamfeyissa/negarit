"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Locale, type TranslationKey, t, localeNames } from "./translations";

const STORAGE_KEY = "negarit.locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  tr: (key: TranslationKey) => string;
  localeNames: typeof localeNames;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  tr: (key) => t.en[key] as string,
  localeNames,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in t) setLocaleState(stored);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  function tr(key: TranslationKey): string {
    return (t[locale][key] ?? t.en[key] ?? key) as string;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, tr, localeNames }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export type { Locale, TranslationKey };
