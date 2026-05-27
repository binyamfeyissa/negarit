"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";

export default function MarketingFooter() {
  const { tr } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">N</div>
              <span className="font-bold text-white text-lg">Negarit</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{tr("footerDesc")}</p>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white uppercase tracking-wide">{tr("explore")}</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">{tr("home")}</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">{tr("features")}</Link></li>
              <li><Link href="/resources" className="hover:text-white transition-colors">{tr("resources")}</Link></li>
              <li><Link href="/resume-builder" className="hover:text-white transition-colors">{tr("resumeBuilder")}</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">{tr("seeAll")}</a></li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white uppercase tracking-wide">{tr("helpAdvice")}</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/resources" className="hover:text-white transition-colors">{tr("footerHelp")}</Link></li>
              <li><Link href="/resources" className="hover:text-white transition-colors">{tr("footerInterview")}</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">{tr("footerPrivacy")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{tr("footerTerms")}</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white uppercase tracking-wide">{tr("company")}</p>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{tr("footerAbout")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{tr("footerCareers")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{tr("footerBlog")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{tr("footerContact")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {year} Negarit. {tr("footerRights")}</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-slate-300 transition-colors">{tr("footerPrivacy")}</a>
            <a href="#" className="hover:text-slate-300 transition-colors">{tr("footerTerms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
