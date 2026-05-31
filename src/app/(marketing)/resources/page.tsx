"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { Clock, ArrowRight, BookOpen, Mic, DollarSign, TrendingUp, Users } from "lucide-react";
import { articles, type ArticleCategory } from "@/lib/resources-data";

type Category = ArticleCategory | "all";

const filters: { key: Category; labelKey: "filterAll" | "filterResume" | "filterInterview" | "filterSalary" | "filterCareer" | "filterNetworking"; Icon: typeof BookOpen }[] = [
  { key: "all", labelKey: "filterAll", Icon: BookOpen },
  { key: "resume", labelKey: "filterResume", Icon: BookOpen },
  { key: "interview", labelKey: "filterInterview", Icon: Mic },
  { key: "salary", labelKey: "filterSalary", Icon: DollarSign },
  { key: "career", labelKey: "filterCareer", Icon: TrendingUp },
  { key: "networking", labelKey: "filterNetworking", Icon: Users },
];

const categoryColors: Record<Category, string> = {
  all: "bg-slate-100 text-slate-700",
  resume: "bg-indigo-100 text-indigo-700",
  interview: "bg-violet-100 text-violet-700",
  salary: "bg-emerald-100 text-emerald-700",
  career: "bg-amber-100 text-amber-700",
  networking: "bg-sky-100 text-sky-700",
};

export default function ResourcesPage() {
  const { tr } = useLocale();
  const [active, setActive] = useState<Category>("all");

  const filtered = active === "all" ? articles : articles.filter((a) => a.category === active);
  const featured = filtered.find((a) => a.featured);
  const rest = filtered.filter((a) => a !== featured);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 mb-6">
            <BookOpen size={14} className="text-indigo-300" />
            <span className="text-xs font-semibold text-indigo-200 tracking-wide">{tr("resCareerLibrary")}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-5">{tr("resourcesTitle")}</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto leading-relaxed">{tr("resourcesSubtitle")}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-12">
          {filters.map(({ key, labelKey, Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                active === key
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              <Icon size={14} />
              {tr(labelKey)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">{tr("mjNoJobs")}</div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <div className="mb-12">
                <Link
                  href={`/resources/${featured.slug}`}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow lg:flex block"
                >
                  <div className="lg:w-1/2 h-64 lg:h-auto relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featured.image}
                      alt={tr(featured.titleKey as Parameters<typeof tr>[0])}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[featured.category]}`}>
                        {tr(filters.find(f => f.key === featured.category)?.labelKey ?? "filterAll")}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock size={12} />
                        {featured.minutes} {tr("resMinRead")}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-3 leading-tight group-hover:text-indigo-700 transition-colors">
                      {tr(featured.titleKey as Parameters<typeof tr>[0])}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      {tr(featured.descKey as Parameters<typeof tr>[0])}
                    </p>
                    <span className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      {tr("resReadArticle")} <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </div>
            )}

            {/* Article grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((article) => (
                <Link
                  key={article.id}
                  href={`/resources/${article.slug}`}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image}
                      alt={tr(article.titleKey as Parameters<typeof tr>[0])}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[article.category]}`}>
                        {tr(filters.find(f => f.key === article.category)?.labelKey ?? "filterAll")}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={11} />
                        {article.minutes} {tr("resMinRead")}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 leading-snug text-sm group-hover:text-indigo-700 transition-colors">
                      {tr(article.titleKey as Parameters<typeof tr>[0])}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {tr(article.descKey as Parameters<typeof tr>[0])}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold text-xs group-hover:gap-2.5 transition-all">
                      {tr("resReadMore")} <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
