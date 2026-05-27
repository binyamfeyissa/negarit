"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { Clock, ArrowRight, BookOpen, Mic, DollarSign, TrendingUp, Users } from "lucide-react";

type Category = "all" | "resume" | "interview" | "salary" | "career" | "networking";

const articles = [
  {
    id: 1,
    category: "resume" as Category,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop",
    minutes: 7,
    titleKey: "How to Write a Resume That Gets You Hired in Ethiopia",
    descKey: "Learn how to structure your CV for the Ethiopian job market, what recruiters look for, and how to make your resume stand out from the crowd.",
    featured: true,
  },
  {
    id: 2,
    category: "resume" as Category,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop",
    minutes: 5,
    titleKey: "5 Resume Mistakes That Cost You Interviews",
    descKey: "Avoid the most common CV errors that cause recruiters to pass on qualified candidates — and learn how to fix them fast.",
    featured: false,
  },
  {
    id: 3,
    category: "interview" as Category,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    minutes: 10,
    titleKey: "How to Answer \"Tell Me About Yourself\" Perfectly",
    descKey: "Master the most common interview opener with a clear formula that highlights your experience, skills, and motivation.",
    featured: true,
  },
  {
    id: 4,
    category: "interview" as Category,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=400&fit=crop",
    minutes: 8,
    titleKey: "30 Common Interview Questions & How to Answer Them",
    descKey: "A comprehensive guide to the questions asked most often in Ethiopian companies, with sample answers for each.",
    featured: false,
  },
  {
    id: 5,
    category: "salary" as Category,
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&h=400&fit=crop",
    minutes: 6,
    titleKey: "How to Negotiate Your Salary Without Losing the Offer",
    descKey: "Step-by-step negotiation scripts and strategies to help you get paid what you are worth without feeling awkward.",
    featured: true,
  },
  {
    id: 6,
    category: "salary" as Category,
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop",
    minutes: 4,
    titleKey: "2025 Salary Guide: What Ethiopia's Top Roles Pay",
    descKey: "Benchmark your salary against real market data for software engineers, finance professionals, marketers, and more.",
    featured: false,
  },
  {
    id: 7,
    category: "career" as Category,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    minutes: 9,
    titleKey: "How to Build Skills Recruiters Actually Want",
    descKey: "Use free and affordable resources to close skill gaps, build a portfolio, and make yourself irresistible to hiring managers.",
    featured: true,
  },
  {
    id: 8,
    category: "career" as Category,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop",
    minutes: 7,
    titleKey: "From Junior to Senior: A Career Roadmap",
    descKey: "How to plan your career progression, seek mentors, and take on the right projects to accelerate your growth.",
    featured: false,
  },
  {
    id: 9,
    category: "networking" as Category,
    image: "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=600&h=400&fit=crop",
    minutes: 6,
    titleKey: "How to Build a Professional Network in Ethiopia",
    descKey: "Practical strategies for meeting the right people, online and offline, to open doors that job boards never can.",
    featured: false,
  },
  {
    id: 10,
    category: "networking" as Category,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
    minutes: 5,
    titleKey: "LinkedIn for Ethiopian Professionals: The Complete Guide",
    descKey: "Optimize your LinkedIn profile, connect strategically, and use the platform to get found by recruiters.",
    featured: false,
  },
];

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
            <span className="text-xs font-semibold text-indigo-200 tracking-wide">Career Library</span>
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
          <div className="text-center py-20 text-slate-400">No articles found.</div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <div className="mb-12">
                <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow lg:flex">
                  <div className="lg:w-1/2 h-64 lg:h-auto relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featured.image}
                      alt={featured.titleKey}
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
                        {featured.minutes} {tr("minRead")}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-3 leading-tight">{featured.titleKey}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{featured.descKey}</p>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:gap-3 transition-all"
                    >
                      Read article <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Article grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((article) => (
                <div
                  key={article.id}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image}
                      alt={article.titleKey}
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
                        {article.minutes} {tr("minRead")}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 leading-snug text-sm">{article.titleKey}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{article.descKey}</p>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold text-xs hover:gap-2.5 transition-all"
                    >
                      Read more <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
