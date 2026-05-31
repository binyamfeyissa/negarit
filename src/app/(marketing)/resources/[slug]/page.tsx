"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, Lightbulb, List, ArrowRight, BookOpen } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { getArticleBySlug, getRelatedArticles, type ArticleSection } from "@/lib/resources-data";

// ── helpers ──────────────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  resume: "bg-indigo-100 text-indigo-700",
  interview: "bg-violet-100 text-violet-700",
  salary: "bg-emerald-100 text-emerald-700",
  career: "bg-amber-100 text-amber-700",
  networking: "bg-sky-100 text-sky-700",
};

const categoryLabelKeys: Record<string, "filterResume" | "filterInterview" | "filterSalary" | "filterCareer" | "filterNetworking"> = {
  resume: "filterResume",
  interview: "filterInterview",
  salary: "filterSalary",
  career: "filterCareer",
  networking: "filterNetworking",
};

// ── section renderer ─────────────────────────────────────────────────────────

type TrFn = (key: Parameters<ReturnType<typeof useLocale>["tr"]>[0]) => string;

function Section({ section, tr }: { section: ArticleSection; tr: TrFn }) {
  const heading = tr(section.headingKey as Parameters<TrFn>[0]);

  if (section.type === "list") {
    const raw = tr(section.itemsKey as Parameters<TrFn>[0]);
    const items = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <List size={18} className="text-indigo-500 shrink-0" />
          {heading}
        </h2>
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed">
              <CheckCircle2 size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (section.type === "tip") {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 space-y-2">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-600 shrink-0" />
          <h2 className="text-base font-bold text-amber-900">{heading}</h2>
        </div>
        <p className="text-sm text-amber-800 leading-relaxed">{tr(section.bodyKey as Parameters<TrFn>[0])}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-slate-900">{heading}</h2>
      <p className="text-slate-700 leading-relaxed">{tr(section.bodyKey as Parameters<TrFn>[0])}</p>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { tr } = useLocale();

  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article, 3);
  const categoryLabelKey = categoryLabelKeys[article.category];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero image + header */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.image}
          alt={tr(article.titleKey as Parameters<typeof tr>[0])}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[article.category]}`}>
                {tr(categoryLabelKey)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <Clock size={12} />
                {article.minutes} {tr("resMinRead")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {tr(article.titleKey as Parameters<typeof tr>[0])}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Back link */}
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          {tr("resBackToResources")}
        </Link>

        {/* Description */}
        <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-indigo-200 pl-4 mb-10">
          {tr(article.descKey as Parameters<typeof tr>[0])}
        </p>

        {/* Table of contents */}
        {article.sections.length > 2 && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mb-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{tr("resTableOfContents")}</p>
            <ol className="space-y-1.5">
              {article.sections.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-indigo-500 font-semibold shrink-0">{i + 1}.</span>
                  <span>{s.heading}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Intro */}
        <p className="text-slate-700 leading-relaxed text-base mb-10">
          {tr(article.introKey as Parameters<typeof tr>[0])}
        </p>

        {/* Body sections */}
        <div className="space-y-10 mb-12">
          {article.sections.map((section, i) => (
            <Section key={i} section={section} tr={tr as TrFn} />
          ))}
        </div>

        {/* Conclusion */}
        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 space-y-2 mb-14">
          <p className="text-sm font-bold text-indigo-700 uppercase tracking-wide">Takeaway</p>
          <p className="text-slate-700 leading-relaxed">{tr(article.conclusionKey as Parameters<typeof tr>[0])}</p>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-linear-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 text-center mb-14 space-y-4">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <BookOpen size={22} className="text-indigo-300" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold">{tr("resGetStarted")}</h3>
          <p className="text-indigo-200 text-sm max-w-md mx-auto leading-relaxed">{tr("resGetStartedDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors"
            >
              {tr("resFindJobs")} <ArrowRight size={15} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 border border-indigo-500 transition-colors"
            >
              {tr("resSignUp")}
            </Link>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">{tr("resRelated")}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/resources/${rel.slug}`}
                  className="group rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow bg-white"
                >
                  <div className="h-36 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.image}
                      alt={tr(rel.titleKey as Parameters<typeof tr>[0])}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoryColors[rel.category]}`}>
                        {tr(categoryLabelKeys[rel.category])}
                      </span>
                      <span className="text-xs text-slate-400">{rel.minutes} {tr("resMinRead")}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                      {tr(rel.titleKey as Parameters<typeof tr>[0])}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
